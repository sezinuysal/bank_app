import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  Button,
  Container,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';

export default function Profile() {
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    role: '',
    lastLogin: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Doğru anahtar: personelId
    const storedPersonelId = localStorage.getItem('personelId');
    if (!storedPersonelId) {
      setSnackbar({ open: true, message: 'Giriş bilgileri bulunamadı. Lütfen tekrar giriş yapın.', severity: 'error' });
      return;
    }

    fetch(`http://localhost:3001/api/user/${storedPersonelId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kullanıcı bilgileri alınamadı (Durum: ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        let formattedLastLogin = '';
        if (data.lastLogin) {
          try {
            const loginDate = new Date(data.lastLogin);
            if (!isNaN(loginDate.getTime())) {
              formattedLastLogin = loginDate.toLocaleString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              });
            } else {
              formattedLastLogin = 'Geçersiz tarih formatı';
            }
          } catch {
            formattedLastLogin = 'Tarih hatası';
          }
        }
        setUserDetails({
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          role: data.role || 'Personel',
          lastLogin: formattedLastLogin
        });
      })
      .catch(err => {
        setSnackbar({ open: true, message: err.message || 'Beklenmedik bir hata oluştu.', severity: 'error' });
      });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={20} sx={{
        p: 7,
        borderRadius: 2,
        background: 'rgba(233, 247, 250, 0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            bgcolor: '#1976d2',
            fontSize: '2rem',
            mr: 3
          }}>
            {userDetails.fullName ? userDetails.fullName.charAt(0).toUpperCase() : '?'}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'black' }}>
              Profil Bilgileri
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Kişisel bilgileriniz
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb:2 }}>
              <PersonIcon sx={{ color: '#1976d2', mr: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Ad Soyad
              </Typography>
            </Box>
            <Typography variant="body1">{userDetails.fullName}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ color: '#1976d2', mr: 2}} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                E-posta
              </Typography>
            </Box>
            <Typography variant="body1">{userDetails.email}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AdminPanelSettingsIcon sx={{ color: '#1976d2', mr: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Yetki Seviyesi
              </Typography>
            </Box>
            <Typography variant="body1">{userDetails.role}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2}}>
              <AccessTimeIcon sx={{ color: '#1976d2', mr: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Son Giriş Zamanı
              </Typography>
            </Box>
            <Typography variant="body1">{userDetails.lastLogin}</Typography>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
} 