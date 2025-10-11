'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Note,
  Speed,
  Refresh,
} from '@mui/icons-material';
import { analytics, UserMetrics } from '../../services/analytics';
import { notesCache, userCache, apiCache } from '../../services/cache';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

function MetricCard({ title, value, change, icon, color = 'primary' }: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositive && <TrendingUp color="success" fontSize="small" />}
                {isNegative && <TrendingDown color="error" fontSize="small" />}
                <Typography
                  variant="body2"
                  color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'textSecondary'}
                  sx={{ ml: 0.5 }}
                >
                  {change > 0 ? '+' : ''}{change}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function CacheMetrics() {
  const [cacheStats, setCacheStats] = useState({
    notes: notesCache.getStats(),
    users: userCache.getStats(),
    api: apiCache.getStats(),
  });

  const refreshStats = () => {
    setCacheStats({
      notes: notesCache.getStats(),
      users: userCache.getStats(),
      api: apiCache.getStats(),
    });
  };

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Cache Performance</Typography>
          <Tooltip title="Refresh Stats">
            <IconButton onClick={refreshStats} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Grid container spacing={2}>
          {Object.entries(cacheStats).map(([type, stats]) => (
            <Grid item xs={12} md={4} key={type}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  {type.toUpperCase()} Cache
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    {stats.size}/{stats.maxSize}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(stats.size / stats.maxSize) * 100}
                    sx={{ flexGrow: 1, mx: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {Math.round((stats.size / stats.maxSize) * 100)}%
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Chip
                    label={`Hit Rate: ${stats.hitRate.toFixed(1)}%`}
                    size="small"
                    color={stats.hitRate > 80 ? 'success' : stats.hitRate > 60 ? 'warning' : 'error'}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const userMetrics = await analytics.getUserMetrics();
        setMetrics(userMetrics);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            change={8.2}
            icon={<People fontSize="large" />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={metrics?.activeUsers || 0}
            change={12.5}
            icon={<TrendingUp fontSize="large" />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="New Users"
            value={metrics?.newUsers || 0}
            change={-2.1}
            icon={<People fontSize="large" />}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Churn Rate"
            value={`${metrics?.churnRate || 0}%`}
            change={-0.8}
            icon={<TrendingDown fontSize="large" />}
            color="error"
          />
        </Grid>

        <Grid item xs={12}>
          <CacheMetrics />
        </Grid>
      </Grid>
    </Box>
  );
}
