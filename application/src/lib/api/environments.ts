import { Environment } from '../../types'; // Import the updated Environment type

export interface CreateEnvironmentData {
  name?: string; // Changed from title
  type: string; // New field
  content?: string; // Optional content for initial setup
}

export interface UpdateEnvironmentData {
  name?: string; // Changed from title
  type?: string; // New field
  status?: string; // New field
  connectionURL?: string; // New field
  content?: string; // Optional content for initial setup
}

export interface PaginatedEnvironments {
  environments: Environment[];
  total: number;
}

/**
 * API client for managing environments
 * This client provides methods to interact with the environments API, including fetching, creating, updating, and deleting environments.
 */
export class EnvironmentsApiClient {
  constructor(private baseURL = '/api/environments') {}
  // Fetch all environments
  async getEnvironments(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
  }): Promise<PaginatedEnvironments> {
    let url = `${this.baseURL}`;
    if (
      params &&
      (params.page !== undefined ||
        params.pageSize !== undefined ||
        params.search !== undefined ||
        params.sortBy !== undefined)
    ) {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.append('page', params.page.toString());
      if (params.pageSize !== undefined) query.append('pageSize', params.pageSize.toString());
      if (params.search !== undefined) query.append('search', params.search);
      if (params.sortBy !== undefined) query.append('sortBy', params.sortBy);
      url += `?${query.toString()}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch environments');
    return res.json();
  }

  // Fetch a specific environment
  async getEnvironment(id: string): Promise<Environment> {
    const res = await fetch(`${this.baseURL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch environment');
    return res.json();
  }

  // Create a new environment
  async createEnvironment(environmentData: CreateEnvironmentData): Promise<Environment> {
    const res = await fetch(`${this.baseURL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(environmentData),
    });
    if (!res.ok) throw new Error('Failed to create environment');
    return res.json();
  }

  // Update an environment
  async updateEnvironment(id: string, updateData: UpdateEnvironmentData): Promise<Environment> {
    const res = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Failed to update environment');
    return res.json();
  }

  // Delete an environment
  async deleteEnvironment(id: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete environment');
  }
}
