import * as React from 'react';
import Layout from '../src/Components/Layout';
import { Typography, Grid, Box, Paper } from '@mui/material';

class Index extends React.Component {
  render() {
    return (
      <Layout maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" component="h1" gutterBottom>
            Homepage
          </Typography>
          <Grid container spacing={2}>
          </Grid>
        </Box>
      </Layout>
    );
  }
}

export default Index;