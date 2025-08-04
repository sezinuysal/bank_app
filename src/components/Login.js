import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  const validateID = (id) => /^\d{11}$/.test(id);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogin = async () => {
    const isValidId = validateID(username);
    if (!isValidId) {
      setSnackbar({ open: true, message: 'Lütfen geçerli bir 11 haneli Personel ID girin.', severity: 'error' });
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userName', data.name);
        localStorage.setItem('personelId', username);
        setSnackbar({ open: true, message: 'Giriş başarılı! Yönlendiriliyorsunuz...', severity: 'success' });
        setTimeout(() => navigate('/home'), 1200);
            } else {
        setSnackbar({ open: true, message: data.message || 'Giriş başarısız!', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Sunucuya ulaşılamadı veya bir hata oluştu!', severity: 'error' });
      console.error('Login Hatası:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: 'url(https://www.ziraatbank.com.tr/PublishingImages/Subpage/bankamiz/BankamizGorselleri/ifm-1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(1.5px)',
          zIndex: 1,
        }}
      />
      <Paper
        elevation={8}
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 440,
          width: '100%',
          mx: 'auto',
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 8px 32px 0 rgba(21,101,192,0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: 800, color: '#1976d2', mb: 4, letterSpacing: 1, textShadow: '0 2px 8px #b3c6e0' }}
        >
          Giriş Yap
            </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Kullanıcı Adı"
            name="username"
            fullWidth
            required
            sx={{ mb: 3, background: '#f4f8fb', borderRadius: 2 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            inputProps={{ maxLength: 11 }}
          />
          <TextField
            label="Şifre"
            name="password"
            type="password"
            fullWidth
            required
            sx={{ mb: 4, background: '#f4f8fb', borderRadius: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.2rem',
              borderRadius: 2,
              py: 2,
              boxShadow: '0 4px 16px 0 rgba(25, 118, 210, 0.10)',
              letterSpacing: 1,
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)',
              },
            }}
          >
            GİRİŞ YAP
          </Button>
        </form>
      </Paper>
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
    </Box>
  );
}