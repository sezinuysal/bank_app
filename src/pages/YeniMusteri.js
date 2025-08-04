// src/pages/YeniMusteri.js

import React, { useState } from 'react';
import {
  Box, TextField, Grid, Button, Typography, MenuItem, Select,
  InputLabel, FormControl, FormHelperText, Paper, Divider, Snackbar, Alert
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Fingerprint from '@mui/icons-material/Fingerprint';
import Cake from '@mui/icons-material/Cake';
import Public from '@mui/icons-material/Public';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
import Wc from '@mui/icons-material/Wc';
import ContactPhone from '@mui/icons-material/ContactPhone';
import Email from '@mui/icons-material/Email';
import Home from '@mui/icons-material/Home';


export default function YeniMusteri() {
  const [formData, setFormData] = useState({
    TCKN: '', SeriNo: '', Ad: '', Soyad: '', DogumTarihi: '',
    Uyruk: '', AnneAdi: '', BabaAdi: '', Cinsiyet: '',
    Email: '', Telefon: '', Adres: ''
  });
  const [tcknError, setTcknError] = useState('');
  const [dogumTarihiError, setDogumTarihiError] = useState('');
  const [idType, setIdType] = useState('TCKN');
  const [musteriTipi, setMusteriTipi] = useState('Gerçek Müşteri');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);

  const getMaxBirthDate = () => {
    const today = new Date();
    const maxYear = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${maxYear}-${month}-${day}`;
  };

  const handleMusteriTipiChange = (e) => {
    const newMusteriTipi = e.target.value;
    setMusteriTipi(newMusteriTipi);

    const newIdType = newMusteriTipi === 'Gerçek Müşteri' ? 'TCKN' : 'VKN';
    setIdType(newIdType);

    setFormData({ ...formData, TCKN: '' });
    setTcknError('');
  };

  const handleIdValueChange = (e) => {
    const value = e.target.value;
    const expectedLength = idType === 'TCKN' ? 11 : 10;
    if (/^[0-9]*$/.test(value) && value.length <= expectedLength) {
      setFormData({ ...formData, TCKN: value });
      const errorMessage = `Lütfen ${expectedLength} haneli bir ${idType} girin.`;
      setTcknError(value && value.length !== expectedLength ? errorMessage : '');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'DogumTarihi') {
      const year = parseInt(value.substring(0, 4), 10);
      const selectedDate = new Date(value);
      const maxDate = new Date(getMaxBirthDate());
      if (year < 1900) setDogumTarihiError('Doğum yılı 1900\'den küçük olamaz.');
      else if (selectedDate > maxDate) setDogumTarihiError('Kullanıcı 18 yaşından küçük olamaz.');
      else setDogumTarihiError('');
    }
  };

  const handleSubmit = async () => {
    console.log('=== FORM SUBMIT BAŞLADI ===');
    console.log('Form Data:', formData);
    console.log('Müşteri Tipi:', musteriTipi);
    console.log('ID Type:', idType);
    
    const expectedLength = idType === 'TCKN' ? 11 : 10;
    let errors = {};
    
    // Zorunlu alanlar
    if (!formData.TCKN || formData.TCKN.length !== expectedLength) {
      errors.TCKN = `Lütfen ${expectedLength} haneli bir ${idType} girin.`;
    }
    if (!formData.Ad) errors.Ad = 'Ad zorunlu';
    if (!formData.Soyad) errors.Soyad = 'Soyad zorunlu';
    if (!formData.DogumTarihi) errors.DogumTarihi = 'Doğum tarihi zorunlu';
    if (!formData.Telefon) errors.Telefon = 'Telefon zorunlu';
    if (!formData.Email) errors.Email = 'E-posta zorunlu';
    if (!formData.Adres) errors.Adres = 'Adres zorunlu';
    if (!formData.Uyruk) errors.Uyruk = 'Uyruk zorunlu';
    if (musteriTipi === 'Gerçek Müşteri') {
      if (!formData.SeriNo) errors.SeriNo = 'Seri No zorunlu';
      if (!formData.AnneAdi) errors.AnneAdi = 'Anne Adı zorunlu';
      if (!formData.BabaAdi) errors.BabaAdi = 'Baba Adı zorunlu';
      if (!formData.Cinsiyet) errors.Cinsiyet = 'Cinsiyet zorunlu';
    }
    
    console.log('Validation Errors:', errors);
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      console.log('FORM VALIDATION FAILED - Durduruluyor');
      return;
    }
    
    console.log('FORM VALIDATION PASSED - Devam ediliyor...');
    // ... mevcut dogum tarihi kontrolleri ...
    if (formData.DogumTarihi) {
      const year = parseInt(formData.DogumTarihi.substring(0, 4), 10);
      const selectedDate = new Date(formData.DogumTarihi);
      const maxDate = new Date(getMaxBirthDate());
      if (year < 1900) {
        setDogumTarihiError('Doğum yılı 1900\'den küçük olamaz.');
        return;
      }
      if (selectedDate > maxDate) {
        setDogumTarihiError('Kullanıcı 18 yaşından küçük olamaz.');
        return;
      }
    }
    setDogumTarihiError('');
    setTcknError('');
    // ...
    console.log("Gönderilen Veri:", formData);
  
  try {
    const response = await fetch('http://localhost:3001/api/new-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
      
      console.log('Response status:', response.status);
      
      if (response.status === 409) {
        setFieldErrors({ TCKN: 'Bu kimlik numarası ile müşteri zaten kayıtlı!' });
        return;
      }
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        setFieldErrors({ general: 'Bir hata oluştu, lütfen tekrar deneyin.' });
        return;
      }
      
      // Başarılı kayıt!
      console.log('Müşteri başarıyla kaydedildi!');
      
      // Formu temizle
      setFormData({
        TCKN: '', SeriNo: '', Ad: '', Soyad: '', DogumTarihi: '',
        Uyruk: '', AnneAdi: '', BabaAdi: '', Cinsiyet: '',
        Email: '', Telefon: '', Adres: ''
      });
      setFieldErrors({});
      
      // Başarı mesajı ve balonları göster
      setSuccessOpen(true);
      setShowBalloons(true);
      
      // Balonları 3 saniye sonra gizle
      setTimeout(() => {
        setShowBalloons(false);
      }, 3000);
      
    } catch (err) {
      console.error('Network error:', err);
      setFieldErrors({ general: 'Sunucuya ulaşılamadı! Lütfen internet bağlantınızı kontrol edin.' });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5, mb: 5, background: 'linear-gradient(to right,rgb(169, 220, 226), #f1f8e9)', p: 5, borderRadius: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'black' }}>
          Yeni Müşteri Hesabı Oluşturma
        </Typography>

        {/* Genel Hata Mesajı */}
        {fieldErrors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {fieldErrors.general}
          </Alert>
        )}

        <Typography variant="h5" gutterBottom> 🪪 Kimlik Bilgileri</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}></Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Müşteri Tipi</InputLabel>
                  <Select
                    value={musteriTipi}
                    onChange={handleMusteriTipiChange}
                    label="Müşteri Tipi"
                  >
                    <MenuItem value="Gerçek Müşteri">Gerçek Müşteri</MenuItem>
                    <MenuItem value="Tüzel Müşteri">Tüzel Müşteri</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={7}>
                <TextField
                  label={idType}
                  name="TCKN"
                  value={formData.TCKN}
                  onChange={handleIdValueChange}
                  fullWidth
                  required
                  error={!!tcknError || !!fieldErrors.TCKN}
                  helperText={tcknError || fieldErrors.TCKN}
                  inputProps={{ maxLength: idType === 'TCKN' ? 11 : 10 }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Grid>
          {musteriTipi === 'Gerçek Müşteri' && (
            <Grid item xs={12} sm={6}>
              <TextField label="Seri No" name="SeriNo" value={formData.SeriNo} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} error={!!fieldErrors.SeriNo} helperText={fieldErrors.SeriNo} />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField label="Ad" name="Ad" value={formData.Ad} onChange={handleChange} fullWidth variant="outlined" inputProps={{ maxLength: 25 }} sx={{ height: 56 }} error={!!fieldErrors.Ad} helperText={fieldErrors.Ad} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Soyad" name="Soyad" value={formData.Soyad} onChange={handleChange} fullWidth variant="outlined" inputProps={{ maxLength: 25 }} error={!!fieldErrors.Soyad} helperText={fieldErrors.Soyad} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!dogumTarihiError || !!fieldErrors.DogumTarihi} sx={{ height: 56 }}>
              <TextField type="date" name="DogumTarihi" label="Doğum Tarihi" InputLabelProps={{ shrink: true }} value={formData.DogumTarihi} onChange={handleChange} fullWidth variant="outlined" inputProps={{ min: '1900-01-01', max: getMaxBirthDate() }} sx={{ height: 56 }} error={!!dogumTarihiError || !!fieldErrors.DogumTarihi} helperText={dogumTarihiError || fieldErrors.DogumTarihi} />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" error={!!fieldErrors.Uyruk}>
              <InputLabel id="uyruk-label">Uyruk</InputLabel>
              <Select
                labelId="uyruk-label"
                name="Uyruk"
                value={formData.Uyruk}
                onChange={handleChange}
                label="Uyruk"
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Uyruk seçiniz</em>
                </MenuItem>
                <MenuItem value="T.C.">T.C. (Türkiye Cumhuriyeti)</MenuItem>
                <MenuItem value="Yabancı">Yabancı Uyruklu</MenuItem>
              </Select>
              {fieldErrors.Uyruk && <FormHelperText>{fieldErrors.Uyruk}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(0, 77, 64, 0.2)' }} />

        {/* Aile Bilgileri */}
        {musteriTipi === 'Gerçek Müşteri' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom> 👨‍👩‍👧‍👦Aile Bilgileri</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField label="Anne Adı" name="AnneAdi" value={formData.AnneAdi} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} error={!!fieldErrors.AnneAdi} helperText={fieldErrors.AnneAdi} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Baba Adı" name="BabaAdi" value={formData.BabaAdi} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} error={!!fieldErrors.BabaAdi} helperText={fieldErrors.BabaAdi} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" error={!!fieldErrors.Cinsiyet}>
                  <InputLabel id="cinsiyet-label">Cinsiyet</InputLabel>
                  <Select
                    labelId="cinsiyet-label"
                    name="Cinsiyet"
                    value={formData.Cinsiyet}
                    onChange={handleChange}
                    label="Cinsiyet"
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Cinsiyet seçiniz</em>
                    </MenuItem>
                    <MenuItem value="Kadın">Kadın</MenuItem>
                    <MenuItem value="Erkek">Erkek</MenuItem>
                    <MenuItem value="Diğer">Diğer</MenuItem>
                  </Select>
                  {fieldErrors.Cinsiyet && <FormHelperText>{fieldErrors.Cinsiyet}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
            <Divider sx={{ my: 4, borderColor: 'rgba(0, 77, 64, 0.2)' }} />
          </>
        )}

        {/* İletişim Bilgileri */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
          <Typography variant="h6" gutterBottom>📞İletişim Bilgileri</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField label="Telefon" name="Telefon" value={formData.Telefon} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} error={!!fieldErrors.Telefon} helperText={fieldErrors.Telefon} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="E-posta" name="Email" value={formData.Email} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} error={!!fieldErrors.Email} helperText={fieldErrors.Email} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <TextField 
            label="Adres" 
            name="Adres" 
            value={formData.Adres} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            rows={4}
            variant="outlined" 
            error={!!fieldErrors.Adres} 
            helperText={fieldErrors.Adres}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: '120px',
                fontSize: '1rem',
              },
              '& .MuiInputBase-input': {
                padding: '12px',
              },
              marginBottom: '20px'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => {
              console.log('=== BUTON TIKLANDI ===');
              handleSubmit();
            }}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #4CAF50 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Müşteriyi Kaydet
          </Button>
        </Box>
        <Snackbar open={successOpen} autoHideDuration={4000} onClose={() => setSuccessOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
            Müşteri başarıyla kaydedildi! 🎉
          </Alert>
        </Snackbar>
        
        {/* Kutlama Balonları Animasyonu */}
        {showBalloons && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
          }}>
            {/* Balonlar */}
            {[...Array(8)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  fontSize: '2rem',
                  animation: `balloonFloat 3s ease-out forwards`,
                  left: `${10 + index * 12}%`,
                  animationDelay: `${index * 0.2}s`,
                  '@keyframes balloonFloat': {
                    '0%': {
                      bottom: '-50px',
                      opacity: 0,
                      transform: 'rotate(0deg) scale(0.5)'
                    },
                    '20%': {
                      opacity: 1,
                      transform: 'rotate(5deg) scale(1)'
                    },
                    '80%': {
                      opacity: 1,
                      transform: 'rotate(-5deg) scale(1)'
                    },
                    '100%': {
                      bottom: '110vh',
                      opacity: 0,
                      transform: 'rotate(10deg) scale(0.8)'
                    }
                  }
                }}
              >
                {['🎈', '🎉', '🎊', '🎇', '⭐', '✨', '🎈', '🎉'][index]}
              </Box>
            ))}
            
            {/* Konfeti Efekti */}
            {[...Array(15)].map((_, index) => (
              <Box
                key={`confetti-${index}`}
                sx={{
                  position: 'absolute',
                  fontSize: '1rem',
                  animation: `confettiFall 2.5s ease-out forwards`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  '@keyframes confettiFall': {
                    '0%': {
                      top: '-20px',
                      opacity: 1,
                      transform: 'rotate(0deg)'
                    },
                    '100%': {
                      top: '100vh',
                      opacity: 0,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }
                  }
                }}
              >
                {['🎊', '✨', '⭐', '🎉', '💫'][Math.floor(Math.random() * 5)]}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
