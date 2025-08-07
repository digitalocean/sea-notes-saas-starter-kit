import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService } from './storage';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';
import { serverConfig } from '../../settings';

/**
 * Service for interacting with DigitalOcean Spaces storage using the AWS S3 API.
 */
export class SpacesStorageService extends StorageService {
  private client: S3Client | null = null;
  private bucketName: string = '';
  private isConfigured: boolean = false;
  private configError: string = '';
  private lastConnectionError: string = '';
  private description: string = 'The following features are impacted: profile picture upload';

  // Service name for consistent display across all status responses
  private static readonly serviceName = 'Storage (DigitalOcean Spaces)';
  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    SPACES_KEY_ID: { envVar: 'SPACES_KEY_ID', description: 'DigitalOcean Spaces Access Key' },
    SPACES_SECRET_KEY: {
      envVar: 'SPACES_SECRET_KEY',
      description: 'DigitalOcean Spaces Secret Key',
    },
    SPACES_BUCKET_NAME: { envVar: 'SPACES_BUCKET_NAME', description: 'Name of the Spaces bucket' },
    SPACES_REGION: { envVar: 'SPACES_REGION', description: 'DigitalOcean Spaces region' },
  };
  constructor() {
    super();
    this.initializeClient();
  }

  /**
   * Initializes the S3 client based on the configuration.
   * Sets isConfigured flag and configError message if applicable.
   */
  private initializeClient(): void {
    try {
    const accessKeyId = serverConfig.Spaces.SPACES_KEY_ID;
    const secretAccessKey = serverConfig.Spaces.SPACES_SECRET_KEY;
    const bucketName = serverConfig.Spaces.SPACES_BUCKET_NAME;
    const region = serverConfig.Spaces.SPACES_REGION;
      const endpoint = `https://${region}.digitaloceanspaces.com`;

      // Check for missing configuration
      const missingConfig = Object.entries(SpacesStorageService.requiredConfig)
        .filter(([key]) => !serverConfig.Spaces[key as keyof typeof serverConfig.Spaces])
        .map(([, value]) => value.envVar);

      if (missingConfig.length > 0) {
        this.isConfigured = false;
        this.configError = 'Missing required configuration';
        return;
      }
      this.bucketName = bucketName!; // Safe to use ! here since we checked for missing config above
      this.client = new S3Client({
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        endpoint,
        region,
        credentials: {
          accessKeyId: accessKeyId!, // Safe to use ! here since we checked for missing config above
          secretAccessKey: secretAccessKey!, // Safe to use ! here since we checked for missing config above
        },
      });
      this.isConfigured = true;
    } catch (error) {
      this.isConfigured = false;
      this.configError =
        error instanceof Error ? error.message : 'Unknown error initializing Spaces client';
    }
  }

  private getFilePath(userId: string, fileName: string): string {
    return `uploads/${userId}/${fileName}`;
  }
  async uploadFile(
    userId: string,
    fileName: string,
    file: File,
    { ACL = 'private' }: { ACL?: 'public-read' | 'private' }
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Storage client not initialized. Check configuration.');
    }

    const fileBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      ACL,
    });

    await this.client.send(command);
    return fileName;
  }

  async getFileUrl(userId: string, fileName: string, expiresIn: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('Storage client not initialized. Check configuration.');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteFile(userId: string, fileName: string): Promise<void> {
    if (!this.client) {
      throw new Error('Storage client not initialized. Check configuration.');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
    });
    await this.client.send(command);
  }

  /**
   * Checks if the Spaces service is properly configured and accessible.
   * Uses ListObjectsV2Command to verify bucket access and connectivity.
   *
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  async checkConnection(): Promise<boolean> {
    if (!this.client) {
      this.lastConnectionError = 'Storage client not initialized';
      return false;
    }

    try {
      // Test connection by listing objects (with limit 1) to verify access
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });
      await this.client.send(listCommand);
      return true;
    } catch (listError) {
      const listErrorMsg = listError instanceof Error ? listError.message : String(listError);

      console.error('Storage connection test failed:', {
        listError: listErrorMsg,
      });

      // Store the last error details for use in checkConfiguration
      this.lastConnectionError = `Connection error: ${listErrorMsg}`;
      return false;
    }
  }

  /**
   * Checks if the storage service configuration is valid and tests connection when configuration is complete.
   */
  async checkConfiguration(): Promise<ServiceConfigStatus> {
    // Check for missing configuration
    const missingConfig = Object.entries(SpacesStorageService.requiredConfig)
      .filter(([key]) => !serverConfig.Spaces[key as keyof typeof serverConfig.Spaces])
      .map(([, value]) => value.envVar);

    if (missingConfig.length > 0) {
      return {
        name: SpacesStorageService.serviceName,
        configured: false,
        connected: undefined, // Don't test connection when configuration is missing
        configToReview: missingConfig,
        error: 'Configuration missing',
        description: this.description,
      };
    }

    // If configured, test the connection
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: SpacesStorageService.serviceName,
        configured: true,
        connected: false,
        configToReview: Object.values(SpacesStorageService.requiredConfig).map(
          (config) => config.envVar
        ),
        error: this.lastConnectionError || 'Connection failed',
        description: this.description,
      };
    }

    return {
      name: SpacesStorageService.serviceName,
      configured: true,
      connected: true,
    };
  }
}
