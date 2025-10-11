import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Stack,
} from '@mui/material';
import { Edit, Visibility, Delete } from '@mui/icons-material';
import { Environment } from 'lib/api/environments';
import { getNameUpdateFlashAnimation } from '../../Common/animations/nameUpdateFlash';

interface EnvironmentsGridViewProps {
  environments: Environment[];
  isLoading: boolean;
  error: string | null;
  onViewEnvironment: (environmentId: string) => void;
  onEditEnvironment: (environmentId: string) => void;
  onDeleteEnvironment: (environmentId: string) => void;
  recentlyUpdatedNames: Set<string>;
}

/**
 * Grid view component for displaying environments in a card-based layout.
 * Provides view, edit, and delete actions for each environment.
 */
const EnvironmentsGridView: React.FC<EnvironmentsGridViewProps> = ({
  environments,
  isLoading,
  error,
  onViewEnvironment,
  onEditEnvironment,
  onDeleteEnvironment,
  recentlyUpdatedNames,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="environments-grid-loading">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="environments-grid-error">
        <Typography color="error" data-testid="environments-grid-error-message">
          {error}
        </Typography>
      </Box>
    );
  }

  if (environments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="environments-grid-empty">
        <Typography>No environments found. Create your first environment!</Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
      data-testid="environments-grid-container"
    >
      {environments.map((environment) => (
        <Card
          key={environment.id}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          data-testid={`environment-card-${environment.id}`}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Stack spacing={2}>
              <Typography 
                variant="h6" 
                component="h3" 
                data-testid={`environment-name-${environment.id}`}
                sx={getNameUpdateFlashAnimation(recentlyUpdatedNames.has(environment.id), true)} // Changed function name
              >
                {environment.name}
              </Typography>{' '}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={environment.type} // Changed from content
                data-testid={`environment-type-${environment.id}`} // Changed from note-content
              >
                {environment.type} {/* Changed from content */}
              </Typography>{' '}
              <Typography
                variant="caption"
                color="text.secondary"
                data-testid={`environment-date-${environment.id}`}
              >
                {new Date(environment.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            {' '}
            <IconButton
              size="small"
              color="primary"
              onClick={() => onViewEnvironment(environment.id)}
              title="View environment"
              data-testid={`environment-view-button-${environment.id}`}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEditEnvironment(environment.id)}
              title="Edit environment"
              data-testid={`environment-edit-button-${environment.id}`}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteEnvironment(environment.id)}
              title="Delete environment"
              data-testid={`environment-delete-button-${environment.id}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default EnvironmentsGridView;
