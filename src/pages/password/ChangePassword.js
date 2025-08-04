import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      validatePassword(value);
    } else if (name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        match: value === formData.newPassword
      }));
    }
  };

  const validatePassword = (password) => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      match: password === formData.confirmPassword
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!Object.values(validations).every(Boolean)) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm şifre kurallarına uyun.',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: localStorage.getItem('personelId'), // userName yerine personelId kullan
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'success'
        });
        // Formu temizle
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Validasyonları sıfırla
        setValidations({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          match: false
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      setSnackbar({
        open: true,
        message: 'Sunucuya bağlanırken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  const passwordRules = [
    { key: 'length', text: 'En az 8 karakter' },
    { key: 'uppercase', text: 'En az 1 büyük harf' },
    { key: 'lowercase', text: 'En az 1 küçük harf' },
    { key: 'number', text: 'En az 1 rakam' },
    { key: 'match', text: 'Şifreler eşleşmeli' },
  ];

  return (
    <Container maxWidth="sm" sx={{ mt: 7, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'rgba(233, 247, 250, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LockIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'black' }}>
              Şifre Değiştir
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Yeni şifreniz aşağıdaki kurallara uygun olmalıdır🔑
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="password"
            label="Mevcut Şifre"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Yeni Şifre"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Yeni Şifre (Tekrar)"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ mb: 3 }}
          />

          <List dense>
            {passwordRules.map(rule => (
              <ListItem key={rule.key}>
                <ListItemIcon>
                  {validations[rule.key] ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText primary={rule.text} />
              </ListItem>
            ))}
          </List>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Şifreyi Güncelle
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 