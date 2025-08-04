// src/pages/sorgula.js (veya MusteriSorgu.js)

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Link } from 'react-router-dom'; // Link importunu kontrol edin

function MusteriSorgu() {
  const [searchParams, setSearchParams] = useState({
    tckn: '',
    ad: '',
    soyad: ''
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useCallback ile fetchCustomers fonksiyonunu memoize ediyoruz
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchParams.tckn) params.append('tckn', searchParams.tckn);
      if (searchParams.ad) params.append('ad', searchParams.ad);
      if (searchParams.soyad) params.append('soyad', searchParams.soyad);

      // Backend'deki /api/customers endpoint'ine istek atıyoruz
      const url = `http://localhost:3001/api/customers?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.text(); // Hata durumunda metin olarak alalım
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorData}`);
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Müşteri getirilirken hata oluştu:", err);
      setError('Müşteriler getirilirken bir sorun oluştu: ' + err.message);
      setCustomers([]); // Hata durumunda müşteri listesini temizle
    } finally {
      setLoading(false); // Yükleme bitti
    }
  }, [searchParams]); // searchParams değiştiğinde fetchCustomers fonksiyonu yeniden oluşturulur

  // Input alanlarındaki değişiklikleri yöneten fonksiyon
  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // Arama butonuna basıldığında çalışacak fonksiyon
  const handleSearch = () => {
    // Eğer arama kriterlerinden hiçbiri girilmemişse uyarı ver
    if (!searchParams.tckn && !searchParams.ad && !searchParams.soyad) {
      setError('Lütfen en az bir arama kriteri girin.');
      setCustomers([]); // Kriter yoksa listeyi temizle
      return;
    }
    fetchCustomers(); // Müşterileri çekmek için fonksiyonu çağır
  };

  return (
    <Box sx={{
      maxWidth: 1200, // Maksimum genişlik
      mx: 'auto', // Yatayda ortala
      mt: 8, // Üstten boşluk
      p: 2, // Padding
      background: 'linear-gradient(135deg,rgb(235, 247, 250) 0%, #bbdefb 100%)', // Arka plan gradyanı
      minHeight: '100vh' // Minimum ekran yüksekliği
    }}>
      {/* Arama formunun bulunduğu Paper componenti */}
      <Paper elevation={6} sx={{
        p: 3, // Padding
        mb: 4, // Alttan boşluk
        borderRadius: 4, // Köşe yuvarlaklığı
        background: 'rgba(255, 255, 255, 0.95)', // Hafif şeffaf beyaz arka plan
        boxShadow: '0 4px 24px 0 rgba(35, 199, 221, 0.84)' // Gölge efekti
      }}>
        <Typography variant="h4" gutterBottom align="center" sx={{
          fontWeight: 700, // Kalın yazı
          color: 'black', // Mavi renk
          letterSpacing: 1 // Harf aralığı
        }}>
          Müşteri Bilgi Sorgulama
        </Typography>
        <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 1 }}>
          {/* TCKN/VKN input alanı */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="TCKN/VKN"
              name="tckn"
              value={searchParams.tckn}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ background: '#f4f8fb', borderRadius:2 }} // Arka plan ve köşe yuvarlaklığı
            />
          </Grid>
          {/* Ad input alanı */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Ad"
              name="ad"
              value={searchParams.ad}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ background: '#f4f8fb', borderRadius: 2 }}
            />
          </Grid>
          {/* Soyad input alanı */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Soyad"
              name="soyad"
              value={searchParams.soyad}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ background: '#f4f8fb', borderRadius: 2 }}
            />
          </Grid>
          {/* Arama butonu */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading} // Yüklenirken butonu pasif yap
              fullWidth
              sx={{
                background: 'linear-gradient(90deg,rgb(233, 191, 233) 0%,rgb(17, 185, 214) 100%)', // Buton gradyanı
                color: '#fff', // Yazı rengi beyaz
                fontWeight: 700, // Kalın yazı
                fontSize: '1.1rem', // Font boyutu
                borderRadius: 2, // Köşe yuvarlaklığı
                py: 2, // Dikey padding
                boxShadow: '0 2px 8px 0 rgba(25,118,210,0.10)', // Buton gölgesi
                '&:hover': { // Hover efekti
                  background: 'linear-gradient(90deg,rgb(139, 181, 230) 0%,rgb(7, 37, 61) 100%)',
                  boxShadow: '0 4px 16px 0 rgba(25,118,210,0.15)',
                }
              }}
            >
              {loading ? 'Aranıyor...' : 'Müşteri Ara'} {/* Yüklenirken buton metnini değiştir */}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Yüklenme göstergesi */}
      {loading && <Typography align="center">Yükleniyor...</Typography>}
      {/* Hata mesajı */}
      {error && <Typography color="error" align="center">{error}</Typography>}
      {/* Müşteri bulunamadığında gösterilecek mesaj */}
      {!loading && !error && customers.length === 0 && (
        <Typography align="center" sx={{ color: '#888', mt: 4 }}>Gösterilecek müşteri bulunamadı.</Typography>
      )}

      {/* Müşteriler bulunduğunda tabloyu göster */}
      {!loading && !error && customers.length > 0 && (
        <TableContainer component={Paper} elevation={5} sx={{
          borderRadius: 4,
          boxShadow: '0 4px 24px 0 rgba(21,101,192,0.10)',
          background: 'rgba(255,255,255,0.98)'
        }}>
          <Table sx={{ minWidth: 650 }}>
            {/* Tablo Başlığı */}
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>TCKN/VKN</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Ad</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Soyad</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Doğum Tarihi</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cinsiyet</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Telefon</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>E-posta</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>İşlemler</TableCell> {/* İşlemler başlığı */}
              </TableRow>
            </TableHead>
            {/* Tablo İçeriği */}
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.CustomerID} hover sx={{ '&:hover': { background: '#e3f2fd' } }}>
                  <TableCell>{customer.TCKN}</TableCell>
                  <TableCell>{customer.FirstName}</TableCell>
                  <TableCell>{customer.LastName}</TableCell>
                  {/* Doğum tarihini yerel formata çevir */}
                  <TableCell>{new Date(customer.BirthDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{customer.Gender}</TableCell>
                  <TableCell>{customer.Phone}</TableCell>
                  <TableCell>{customer.Email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* İşlem Ekle Butonu */}
                      <Button
                        component={Link}
                        // TransactionAdd sayfasına accountId ile yönlendir
                        to={`/transaction-add?accountId=${customer.MainAccountID || ''}`}
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          background: 'linear-gradient(90deg, #43ea7f 0%, #1de9b6 100%)',
                          color: '#fff',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #1de9b6 0%, #43ea7f 100%)',
                            color: '#fff',
                          }
                        }}
                        startIcon={<span role="img" aria-label="ekle">💸</span>}
                      >
                        İşlem Ekle
                      </Button>
                      {/* İşlemleri Gör Butonu */}
                      <Button
                        component={Link}
                        // App.js'deki rotanıza uygun olarak TCKN'yi parametre olarak gönderin
                        to={`/transaction-history/${customer.TCKN}`}
                        variant="contained"
                        color="info"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          background: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)',
                          color: '#fff',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                            color: '#fff',
                          }
                        }}
                        startIcon={<span role="img" aria-label="gör">📉</span>}
                      >
                        İşlemleri Gör
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default MusteriSorgu;