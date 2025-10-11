import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import { Edit, Visibility, Delete } from '@mui/icons-material';
import { Environment } from 'lib/api/environments';
import { getNameUpdateFlashAnimation } from '../../Common/animations/nameUpdateFlash';

interface EnvironmentsListViewProps {
  environments: Environment[];
  isLoading: boolean;
  error: string | null;
  onViewEnvironment: (environmentId: string) => void;
  onEditEnvironment: (environmentId: string) => void;
  onDeleteEnvironment: (environmentId: string) => void;
  recentlyUpdatedNames: Set<string>;
}

/**
 * List view component for displaying environments in a table format.
 * Provides view, edit, and delete actions for each environment in a tabular layout.
 */
const EnvironmentsListView: React.FC<EnvironmentsListViewProps> = ({
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
      <Box display="flex" justifyContent="center" p={4} data-testid="environments-list-loading">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="environments-list-error">
        <Typography color="error" data-testid="environments-list-error-message">
          {error}
        </Typography>
      </Box>
    );
  }
  if (environments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4} data-testid="environments-list-empty">
        <Typography>No environments found. Create your first environment!</Typography>
      </Box>
    );
  }
  return (
    <TableContainer component={Paper} data-testid="environments-list-container">
      <Table data-testid="environments-table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell> {/* Changed from Title */}
            <TableCell>Type</TableCell> {/* Changed from Content */}
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {environments.map((environment) => (
            <TableRow key={environment.id} hover data-testid={`environment-row-${environment.id}`}>
              <TableCell 
                data-testid={`environment-name-cell-${environment.id}`} // Changed from note-title-cell
                sx={getNameUpdateFlashAnimation(recentlyUpdatedNames.has(environment.id))} // Changed function name
              >
                <Typography variant="body1" data-testid={`environment-name-${environment.id}`}> // Changed from note-title
                  {environment.name}
                </Typography>
              </TableCell>
              <TableCell data-testid={`environment-type-cell-${environment.id}`}> // Changed from note-content-cell
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: '300px', // Set a maximum width for the content
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block', // Ensures the typography behaves as a block element
                  }}
                  title={environment.type} // Show full content on hover, changed from content
                  data-testid={`environment-type-${environment.id}`} // Changed from note-content
                >
                  {environment.type} // Changed from content
                </Typography>
              </TableCell>
              <TableCell data-testid={`environment-date-cell-${environment.id}`}> // Changed from note-date-cell
                <Typography
                  variant="body2"
                  color="text.secondary"
                  data-testid={`environment-date-${environment.id}`} // Changed from note-date
                >
                  {new Date(environment.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell data-testid={`environment-actions-cell-${environment.id}`}> // Changed from note-actions-cell
                <Stack direction="row" spacing={1}>
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
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EnvironmentsListView;
