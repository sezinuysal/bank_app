import React from 'react';
import HesapOlustur from './HesapOlustur';
import { Container, Paper, Typography, Box } from '@mui/material';

const HesapIslemleri = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(225, 192, 238) 0%,rgb(181, 234, 243) 100%)',
      py: { xs: 4, md: 10 },
      px: 0
    }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, mb: 4, background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 32px rgba(10, 37, 194, 0.64)' }}>
          <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 2}}>
            Hesap İşlemleri
          </Typography>
          <Typography variant="subtitle1" align="center" color="black" sx={{ mb:2, fontWeight: 600}}>
            Yeni bir hesap oluşturmak için aşağıdaki formu doldurun.
            💷
          </Typography>
          <HesapOlustur />
        </Paper>
      </Container>
    </Box>
  );
};

export default HesapIslemleri;
