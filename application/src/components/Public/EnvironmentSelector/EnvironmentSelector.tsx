import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';

const environments = [
  {
    name: 'ROS2 Humble Ubuntu Desktop Environment',
    description: 'A complete desktop environment with ROS2 Humble pre-installed.',
  },
  {
    name: 'ROS2 with Isaac Lab Ubuntu Desktop Environment',
    description: 'A complete desktop environment with ROS2 and Isaac Lab pre-installed.',
  },
];

const EnvironmentSelector = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {environments.map((env, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  {env.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {env.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EnvironmentSelector;
