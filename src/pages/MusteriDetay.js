// src/pages/MusteriDetay.js

import React, { useState } from 'react';
import {
  Box, TextField, Grid, Button, Typography, MenuItem, Select,
  InputLabel, FormControl, FormHelperText, Paper, Divider
} from '@mui/material';

export default function MusteriDetay() {
  const [formData, setFormData] = useState({
    TCKN: '', SeriNo: '', Ad: '', Soyad: '', DogumTarihi: '',
    Uyruk: '', AnneAdi: '', BabaAdi: '', Cinsiyet: '',
    Email: '', Telefon: '', Adres: ''
  });
  const [tcknError, setTcknError] = useState('');
  const [dogumTarihiError, setDogumTarihiError] = useState('');
  const [idType, setIdType] = useState('TCKN');

  const getMaxBirthDate = () => {
    const today = new Date();
    const maxYear = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${maxYear}-${month}-${day}`;
  };

  const handleIdTypeChange = (e) => {
    const newIdType = e.target.value;
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
    const expectedLength = idType === 'TCKN' ? 11 : 10;
    if (formData.TCKN.length !== expectedLength) {
      setTcknError(`Lütfen ${expectedLength} haneli bir ${idType} girin.`);
      return;
    }
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
    console.log("Gönderilen Veri:", { ...formData, idType });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Yeni Müşteri Kaydı
        </Typography>

        <Typography variant="h6" gutterBottom>Kimlik Bilgileri</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Kimlik Türü</InputLabel>
                  <Select
                    value={idType}
                    onChange={handleIdTypeChange}
                    label="Kimlik Türü"
                  >
                    <MenuItem value="TCKN">TCKN</MenuItem>
                    <MenuItem value="VKN">VKN</MenuItem>
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
                  error={!!tcknError}
                  helperText={tcknError}
                  inputProps={{ maxLength: idType === 'TCKN' ? 11 : 10 }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Seri No" name="SeriNo" value={formData.SeriNo} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Ad" name="Ad" value={formData.Ad} onChange={handleChange} fullWidth variant="outlined" inputProps={{ maxLength: 25 }} sx={{ height: 56 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Soyad" name="Soyad" value={formData.Soyad} onChange={handleChange} fullWidth variant="outlined" inputProps={{ maxLength: 25 }} sx={{ height: 56 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!dogumTarihiError} sx={{ height: 56 }}>
              <TextField type="date" name="DogumTarihi" label="Doğum Tarihi" InputLabelProps={{ shrink: true }} value={formData.DogumTarihi} onChange={handleChange} fullWidth variant="outlined" inputProps={{ min: '1900-01-01', max: getMaxBirthDate() }} sx={{ height: 56 }} />
              {dogumTarihiError && <FormHelperText>{dogumTarihiError}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ height: 56 }}>
              <InputLabel id="uyruk-label">Uyruk</InputLabel>
              <Select labelId="uyruk-label" name="Uyruk"
                id="Uyruk" value={formData.Uyruk}
                renderValue={(selected) => selected || 'Uyruk Seçiniz'} onChange={handleChange} label="Uyruk">
                <MenuItem value="" disabled><em>Uyruk Seçiniz</em></MenuItem>
                <MenuItem value="T.C.">T.C. (Türkiye Cumhuriyeti)</MenuItem>
                <MenuItem value="Yabancı">Yabancı Uyruklu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>Aile Bilgileri</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField label="Anne Adı" name="AnneAdi" value={formData.AnneAdi} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56, width :'300px', marginTop:'20px', marginBottom:'20px'}} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Baba Adı" name="BabaAdi" value={formData.BabaAdi} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" sx={{ height: 56 }}>
              <InputLabel id="cinsiyet-label">Cinsiyet</InputLabel>
              <Select labelId="cinsiyet-label" name="Cinsiyet"
                id="Cinsiyet" value={formData.Cinsiyet}
                renderValue={(selected) => selected || 'Cinsiyet Seçiniz'} onChange={handleChange} label="Cinsiyet">
                <MenuItem value="" disabled><em>Cinsiyet Seçiniz</em></MenuItem>
                <MenuItem value="Kadın">Kadın</MenuItem>
                <MenuItem value="Erkek">Erkek</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>İletişim Bilgileri</Typography>
        <Grid container spacing={9}>
          <Grid item xs={6} sm={6}>
            <TextField label="Telefon" name="Telefon" value={formData.Telefon} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="E-posta" name="Email" value={formData.Email} onChange={handleChange} fullWidth variant="outlined" sx={{ height: 56 }} />
          </Grid>
          <Grid item xs={12}>
             <TextField label="Adres" name="Adres" value={formData.Adres} onChange={handleChange} fullWidth multiline rows={3} variant="outlined" />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button variant="contained" size="large" onClick={handleSubmit}>
            Müşteriyi Kaydet
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 