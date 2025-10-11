import React, { ChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Stack,
} from '@mui/material';
import { Add, Search, List, GridView } from '@mui/icons-material';

interface EnvironmentsHeaderProps {
  searchQuery: string;
  sortBy: string;
  viewMode: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } }),
    child: React.ReactNode
  ) => void;
  onViewModeChange: (mode: string) => void;
  onCreateEnvironment: () => void;
}

/**
 * Header component for environments page with search, sort, view mode controls, and create button.
 * Provides filtering and layout controls for the environments interface.
 */
const EnvironmentsHeader: React.FC<EnvironmentsHeaderProps> = ({
  searchQuery,
  sortBy,
  viewMode,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onCreateEnvironment,
}) => {
  return (
    <Box data-testid="environments-header">
      {/* Header */}
      <Stack direction="row" justifyContent="right" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateEnvironment}
          size="small"
          data-testid="environments-create-button"
        >
          Create Environment
        </Button>
      </Stack>
      {/* Search and Filter Controls */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
        {' '}
        <TextField
          placeholder="Search environments..."
          value={searchQuery}
          onChange={onSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
          inputProps={{ 'data-testid': 'environments-search-input' }}
        />{' '}
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={sortBy}
            onChange={onSortChange}
            displayEmpty
            size="small"
            data-testid="environments-sort-select"
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="name">Name</MenuItem> {/* Changed from title */}
          </Select>
        </FormControl>{' '}
        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => onViewModeChange('list')}
            size="small"
            data-testid="environments-list-view-button"
          >
            <List fontSize="small" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => onViewModeChange('grid')}
            size="small"
            data-testid="environments-grid-view-button"
          >
            <GridView fontSize="small" />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EnvironmentsHeader;
