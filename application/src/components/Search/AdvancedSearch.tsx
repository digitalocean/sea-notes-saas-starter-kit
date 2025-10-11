'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  ExpandLess,
  AccessTime,
  Title,
  Description,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { searchService, SearchFilters, SearchResult } from '../../services/search';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  tags?: string[];
}

interface AdvancedSearchProps {
  notes: Note[];
  onResultSelect?: (note: Note) => void;
}

export default function AdvancedSearch({ notes, onResultSelect }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [results, setResults] = useState<SearchResult<Note>[]>([]);

  // Extract all unique tags from notes
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [notes]);

  // Perform search whenever query or filters change
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchService.search(notes, query, filters);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, filters, notes]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const highlighted = searchService.highlightMatches(text, query);
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  startIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => setShowFilters(!showFilters)}
                  size="small"
                >
                  <FilterList />
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Advanced Filters
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
              {/* Tags Filter */}
              <Autocomplete
                multiple
                options={availableTags}
                value={filters.tags || []}
                onChange={(_, value) => handleFilterChange('tags', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Select tags" />
                )}
                sx={{ minWidth: 200 }}
              />

              {/* Date Range */}
              <DatePicker
                label="Start Date"
                value={filters.dateRange?.start || null}
                onChange={(date) => 
                  handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    start: date || new Date(),
                  })
                }
                slotProps={{ textField: { size: 'small' } }}
              />

              <DatePicker
                label="End Date"
                value={filters.dateRange?.end || null}
                onChange={(date) => 
                  handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    end: date || new Date(),
                  })
                }
                slotProps={{ textField: { size: 'small' } }}
              />

              {/* Sort Options */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  label="Order"
                >
                  <MenuItem value="desc">Desc</MenuItem>
                  <MenuItem value="asc">Asc</MenuItem>
                </Select>
              </FormControl>

              <Button onClick={clearFilters} variant="outlined" size="small">
                Clear Filters
              </Button>
            </Box>
          </Paper>
        </Collapse>

        {/* Search Results */}
        {query.trim() && (
          <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
            {results.length === 0 ? (
              <Box p={3} textAlign="center">
                <Typography color="textSecondary">
                  No results found for "{query}"
                </Typography>
              </Box>
            ) : (
              <>
                <Box p={2} bgcolor="grey.50">
                  <Typography variant="subtitle2">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </Typography>
                </Box>
                <List>
                  {results.map((result, index) => (
                    <React.Fragment key={result.item.id}>
                      <ListItem
                        button
                        onClick={() => onResultSelect?.(result.item)}
                        sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                      >
                        <Box display="flex" alignItems="center" width="100%" mb={1}>
                          <Title fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                            {highlightText(result.item.title, query)}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={`${Math.round(result.score * 100)}% match`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="caption" color="textSecondary">
                              <AccessTime fontSize="inherit" sx={{ mr: 0.5 }} />
                              {result.item.createdAt.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="flex-start" width="100%">
                          <Description fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
                            {highlightText(
                              result.item.content.substring(0, 150) + 
                              (result.item.content.length > 150 ? '...' : ''),
                              query
                            )}
                          </Typography>
                        </Box>

                        {result.matches.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="caption" color="textSecondary">
                              Matches in: {result.matches.join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </ListItem>
                      {index < results.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </>
            )}
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
}
