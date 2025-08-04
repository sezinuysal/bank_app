import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Box, Typography, Grid, MenuItem, Select,
  InputLabel, FormControl, Paper, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

// Sabit veriler ve konfigürasyonlar
const hesapTurleri = [
  { id: 'vadesiz', label: 'Vadesiz Hesap', minTutar: 0 },
  { id: 'vadeli', label: 'Vadeli Hesap', minTutar: 1000 },
  { id: 'altin', label: 'Altın Hesap' },
  { id: 'doviz', label: 'Döviz Hesabı' },
  { id: 'kmh', label: 'Kredili Mevduat Hesabı' },
  { id: 'yatirim', label: 'Yatırım Hesabı' }
];

const musteriTipleri = [
  { id: 'gercek', label: 'Gerçek Müşteri' },
  { id: 'tuzel', label: 'Tüzel Müşteri' }
];

// Sadece gün sayılarını içeriyor, faiz oranları getFaizOrani fonksiyonunda belirlenecek.
const vadeSureleri = [
  { sure: 30 },
  { sure: 60 },
  { sure: 90 },
  { sure: 180 },
  { sure: 360 }
];

// TCMB kurlarına uygun olarak güncellendi
const dovizKodlari = [
  { kod: 'TRY', label: 'Türk Lirası' },
  { kod: 'USD', label: 'Amerikan Doları' },
  { kod: 'EUR', label: 'Euro' },
  { kod: 'GBP', label: 'İngiliz Sterlini' },
];

// Ana bileşen
function HesapOlustur() {
  // Form verileri için state
  const [form, setForm] = useState({
    musteriTipi: '',
    hesapTuru: '',
    vadeSuresi: '',
    dovizKodu: 'TRY',
    bakiye: '',
    hesapAdi: '',
    tckn: '',
    ekNo: ''
  });

  // TCMB Kurları ve Faiz Oranı ile ilgili state'ler
  const [tcmbRates, setTcmbRates] = useState([]); // TCMB kurlarını saklamak için
  const [policyRate, setPolicyRate] = useState(null); // TCMB politika faizini saklamak için
  const [minMaxRates, setMinMaxRates] = useState({ minRate: null, maxRate: null }); // Politika faizi bazlı min/max oranlar

  const [tcknError, setTcknError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [customFaizOrani, setCustomFaizOrani] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1); // Seçilen döviz kurunun TRY karşılığı
  const [convertedBalance, setConvertedBalance] = useState(''); // Bakiyenin TL karşılığı

  // Seçilen hesap türüne göre minimum tutarı döndürür
  const getMinimumTutar = () => {
    if (form.hesapTuru === 'vadeli') return 1000;
    return 0;
  };

  // TCKN/VKN geçerliliğini kontrol eder
  const validateId = (id) => {
    if (!form.musteriTipi) return false;
    const expectedLength = form.musteriTipi === 'gercek' ? 11 : 10;
    return new RegExp(`^\\d{${expectedLength}}$`).test(id);
  };

  // Seçilen döviz kurunun TRY karşılığını çekmek için useEffect
  useEffect(() => {
    if (form.dovizKodu === "TRY" || !form.dovizKodu) {
      setExchangeRate(1);
      return;
    }

    const fetchRate = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/tcmb-rates`);
        const rates = response.data;
        const currencyData = rates.find(r => r.symbol.startsWith(form.dovizKodu + '/'));

        if (currencyData && currencyData.price) {
          setExchangeRate(currencyData.price);
        } else {
          console.error("Belirtilen döviz kuru TCMB verilerinde bulunamadı:", form.dovizKodu);
          setExchangeRate(1);
          setSnackbar({ open: true, message: `${form.dovizKodu} kuru bilgisi bulunamadı.`, severity: 'warning' });
        }
      } catch (error) {
        console.error(`TCMB kurları çekilirken hata:`, error.message);
        setExchangeRate(1);
        setSnackbar({ open: true, message: 'TCMB kurları alınamadı. Backend çalışıyor mu?', severity: 'error' });
      }
    };

    fetchRate();

  }, [form.dovizKodu]);

  // Bakiye veya kur değiştikçe TL karşılığını hesaplar
  useEffect(() => {
    const amount = parseFloat(form.bakiye);
    if (!isNaN(amount) && exchangeRate !== null && form.dovizKodu) {
      const converted = form.dovizKodu === "TRY" ? amount : amount * exchangeRate;
      setConvertedBalance(converted.toFixed(2));
    } else {
      setConvertedBalance('');
    }
  }, [form.bakiye, exchangeRate, form.dovizKodu]);

  // TCMB Politika Faizini Çekme useEffect'i
  useEffect(() => {
    const fetchPolicyRate = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/policy-rate`);
        if (response.data && response.data.policyRate) {
          setPolicyRate(response.data.policyRate);
          setMinMaxRates({ minRate: response.data.minRate, maxRate: response.data.maxRate });
        } else {
          console.warn('TCMB politika faizi alınamadı.');
          setSnackbar({ open: true, message: 'TCMB politika faizi bilgisi alınamadı.', severity: 'warning' });
        }
      } catch (error) {
        console.error(`TCMB politika faizi çekilirken hata:`, error.message);
        
      }
    };

    fetchPolicyRate();
  }, []);

  // Seçilen vadeye veya özel girişe göre faiz oranını belirler
  const getFaizOrani = () => {
    if (form.hesapTuru !== 'vadeli') return 0;

    // Her vade için sabit faiz oranı
    const faizOranlariMap = {
      30: 43,
      60: 41,
      90: 39,
      180: 37,
      360: 35
    };

    if (form.vadeSuresi === 'custom') {
      const parsedCustomRate = parseFloat(customFaizOrani);
      return !isNaN(parsedCustomRate) ? parsedCustomRate : 0;
    }

    const selectedSure = parseInt(form.vadeSuresi);
    return faizOranlariMap[selectedSure] || 0;
  };

  // Faiz oranı aralığını döndürür (min ve max aynı olacak)
  const getFaizOraniRange = () => {
    if (!policyRate) return { minRate: 0, maxRate: 0 };
    
    const baseRate = policyRate / 100;
    let minRate, maxRate;
    
    if (form.vadeSuresi === 30) {
      minRate = maxRate = baseRate * 0.85;
    } else if (form.vadeSuresi === 60) {
      minRate = maxRate = baseRate * 0.90;
    } else if (form.vadeSuresi === 90) {
      minRate = maxRate = baseRate * 0.95;
    } else if (form.vadeSuresi === 180) {
      minRate = maxRate = baseRate;
    } else if (form.vadeSuresi === 360) {
      minRate = maxRate = baseRate * 1.05;
    } else {
      minRate = maxRate = baseRate;
    }
    
    return { minRate: minRate * 100, maxRate: maxRate * 100 };
  };

  // Vade sonu tutarını hesaplayan fonksiyon
  const calculateMaturityAmount = () => {
    const principal = parseFloat(form.bakiye);
    if (!principal || principal <= 0) return 0;
    
    let interestRate;
    let termInDays;
    
    // Faiz oranını belirle
    if (form.vadeSuresi === 'custom' && customFaizOrani) {
      interestRate = parseFloat(customFaizOrani) / 100;
    } else if (form.vadeSuresi && form.vadeSuresi !== 'custom') {
      interestRate = getFaizOrani() / 100;
      termInDays = parseInt(form.vadeSuresi);
    } else {
      return 0;
    }
    
    // Vade süresini belirle
    if (form.vadeSuresi === 'custom') {
      // Özel vade girişi için varsayılan olarak 90 gün kullan
      termInDays = 90;
    } else {
      termInDays = parseInt(form.vadeSuresi);
    }
    
    // Basit faiz hesaplaması: Ana Para + (Ana Para × Faiz Oranı × Gün Sayısı / 365)
    const interest = principal * interestRate * (termInDays / 365);
    const maturityAmount = principal + interest;
    
    return maturityAmount;
  };

  // Kazanç miktarını hesaplayan fonksiyon
  const calculateInterestEarned = () => {
    const principal = parseFloat(form.bakiye);
    const maturityAmount = calculateMaturityAmount();
    return maturityAmount - principal;
  };

  // Form elemanlarındaki değişiklikleri yönetir
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };

      if (name === 'musteriTipi') {
        newForm.tckn = '';
        setTcknError('');
      }

      if (name === 'hesapTuru') {
        newForm.vadeSuresi = '';
        setCustomFaizOrani('');
      }

      if (name === 'vadeSuresi' && value !== 'custom') {
        setCustomFaizOrani('');
      }

      if (name === 'tckn') {
        const idType = form.musteriTipi === 'gercek' ? 'TCKN' : 'VKN';
        const expectedLength = form.musteriTipi === 'gercek' ? 11 : 10;
        if (value && !new RegExp(`^\\d{${expectedLength}}$`).test(value)) {
          setTcknError(`Lütfen geçerli bir ${expectedLength} haneli ${idType} girin.`);
        } else {
          setTcknError('');
        }
      }

      return newForm;
    });
  };

  // Vade süresi seçimi değiştiğinde çalışacak özel handler
  const handleVadeSuresiChange = (e) => {
    const { value } = e.target;
    handleChange({ target: { name: 'vadeSuresi', value: value } });
    if (value === 'custom') {
      setCustomFaizOrani('');
    }
  };

  // Özel Faiz Oranı input'u değiştiğinde çalışacak handler
  const handleCustomFaizOraniChange = (e) => {
    const { value } = e.target;
    setCustomFaizOrani(value);
  };

  // Formu gönderme ve hesap oluşturma işlemi
  const handleSubmit = async () => {
    // Gerekli alan kontrolü ve validasyonlar
    if (!form.musteriTipi) {
      setSnackbar({ open: true, message: 'Lütfen müşteri tipini seçin.', severity: 'error' });
      return;
    }
    if (!validateId(form.tckn)) {
      const idType = form.musteriTipi === 'gercek' ? 'TCKN' : 'VKN';
      setSnackbar({ open: true, message: `Lütfen geçerli bir ${idType} girin.`, severity: 'error' });
      return;
    }
    if (!form.hesapTuru) {
      setSnackbar({ open: true, message: 'Lütfen hesap türünü seçin.', severity: 'error' });
      return;
    }
    if (form.hesapTuru === 'vadeli' && !form.vadeSuresi) {
      setSnackbar({ open: true, message: 'Lütfen vade süresini seçin.', severity: 'error' });
      return;
    }
    if (form.hesapTuru === 'vadeli' && form.vadeSuresi === 'custom' && (!customFaizOrani || parseFloat(customFaizOrani) <= 0)) {
      setSnackbar({ open: true, message: 'Lütfen geçerli bir özel faiz oranı girin.', severity: 'error' });
      return;
    }
    const numericBakiye = parseFloat(form.bakiye);
    const minTutar = getMinimumTutar();
    if (isNaN(numericBakiye) || numericBakiye < minTutar) {
      setSnackbar({ open: true, message: `Lütfen geçerli bir bakiye girin. Minimum tutar: ${minTutar} ${form.dovizKodu}`, severity: 'error' });
      return;
    }

    // Bakiye limitini kontrol et (1 milyar TL)
    const BALANCE_LIMIT = 1000000000; // 1 milyar
    const balanceInTRY = form.dovizKodu === 'TRY' ? numericBakiye : numericBakiye * exchangeRate;
  
    if (balanceInTRY > BALANCE_LIMIT) {
      setSnackbar({ 
        open: true, 
        message: `UYARI: Bakiye ${BALANCE_LIMIT.toLocaleString('tr-TR')} TL limitini aşamaz! Girilen miktar TL karşılığı: ${balanceInTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, 
        severity: 'error' 
      });
      return;
    }

    const hesapVerisi = {
      ...form,
      faizOrani: getFaizOrani(),
      hesapTipi: form.hesapTuru.toUpperCase()
    };

    try {
      const response = await axios.post('http://localhost:3001/create-account', hesapVerisi);

      if (response.status === 201) {
        setSnackbar({ open: true, message: 'Hesap başarıyla oluşturuldu!', severity: 'success' });
        setForm({
          musteriTipi: '', hesapTuru: '', vadeSuresi: '', dovizKodu: 'TRY',
          bakiye: '', hesapAdi: '', tckn: '', ekNo: ''
        });
        setTcknError('');
        setCustomFaizOrani('');
        setConvertedBalance('');
        setExchangeRate(1);
        setPolicyRate(null);
        setMinMaxRates({ minRate: null, maxRate: null });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Hesap oluşturulurken bir hata oluştu.', severity: 'error' });
      }
    } catch (error) {
      console.error("Hesap oluşturma sırasında sunucu hatası:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Bilinmeyen bir hata oluştu.';
      setSnackbar({ open: true, message: `Sunucu hatası: ${errorMessage}`, severity: 'error' });
    }
  };

  const inputProps = {
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      }
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', p: 2, background: '#e3f2fd'
    }}>
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 4 }, width: '100%', maxWidth: 850, borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', my: 4,
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 14, color: 'rgba(95, 10, 77, 0.9)', fontWeight: 700 }}>
          Yeni Hesap Oluşturma
        </Typography>

        <Grid container spacing={3}>
          {/* Müşteri Tipi */}
          <Grid item xs={12} md={6} sx={{ minWidth: 220 }}>
            <FormControl fullWidth {...inputProps} required>
              <InputLabel>Müşteri Tipi</InputLabel>
              <Select name="musteriTipi" value={form.musteriTipi} label="Müşteri Tipi" onChange={handleChange} fullWidth>
                {musteriTipleri.map((tip) => <MenuItem key={tip.id} value={tip.id}>{tip.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* TCKN/VKN */}
          <Grid item xs={12} md={6}>
            {form.musteriTipi && (
              <TextField
                required name="tckn" label={form.musteriTipi === 'gercek' ? 'TCKN' : 'VKN'}
                fullWidth value={form.tckn} onChange={handleChange}
                error={!!tcknError} helperText={tcknError}
                inputProps={{ maxLength: form.musteriTipi === 'gercek' ? 11 : 10 }}
                {...inputProps}
              />
            )}
          </Grid>
          
          {/* Hesap Türü */}
          <Grid item xs={12} md={6} sx={{ minWidth: 220 }}>
            <FormControl fullWidth {...inputProps} required>
              <InputLabel>Hesap Türü</InputLabel>
              <Select name="hesapTuru" value={form.hesapTuru} label="Hesap Türü" onChange={handleChange} fullWidth>
                {hesapTurleri.map((tur) => <MenuItem key={tur.id} value={tur.id}>{tur.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Vade Süresi (Vadeli Hesap için) */}
          {form.hesapTuru === 'vadeli' && (
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  Vade Süresi *
                </Typography>
                <FormControl fullWidth required={form.hesapTuru === 'vadeli'} sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}>
                  <Select
                    name="vadeSuresi"
                    value={form.vadeSuresi}
                    onChange={handleVadeSuresiChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Vade süresini seçin
                    </MenuItem>
                    {vadeSureleri.map((vade) => (
                      <MenuItem key={vade.sure} value={vade.sure}>
                        {vade.sure} Gün
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">Özel Giriş</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          )}

          {/* Özel Faiz Oranı (Özel Giriş seçildiğinde) */}
          {form.hesapTuru === 'vadeli' && form.vadeSuresi === 'custom' && (
            <Grid item xs={12} md={6}>
              <TextField
                name="customFaizOrani" label="Özel Faiz Oranı (%)" type="number"
                fullWidth value={customFaizOrani}
                onChange={handleCustomFaizOraniChange}
                {...inputProps}
                required
              />
            </Grid>
          )}
          
          {/* Döviz Cinsi */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth {...inputProps} required>
              <InputLabel>Döviz Cinsi</InputLabel>
              <Select name="dovizKodu" value={form.dovizKodu} label="Döviz Cinsi" onChange={handleChange}>
                {dovizKodlari.map((doviz) => <MenuItem key={doviz.kod} value={doviz.kod}>{doviz.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Bakiye */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="bakiye" label={`Başlangıç Bakiyesi`}
              helperText={form.hesapTuru === 'vadeli' ? `Min: ${getMinimumTutar()} ${form.dovizKodu}` : ''}
              fullWidth type="number" value={form.bakiye} onChange={handleChange}
              required
              {...inputProps}
            />
          </Grid>

          {/* Hesap Adı ve Ek No */}
          <Grid item xs={12} sm={6}>
            <TextField name="hesapAdi" label="Hesap Adı (Opsiyonel)" fullWidth value={form.hesapAdi} onChange={handleChange} {...inputProps} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="ekNo" label="Hesap Ek No (Opsiyonel)" fullWidth type="number" value={form.ekNo} onChange={handleChange} {...inputProps} />
          </Grid>

          {/* Bilgi Kartı (Hesap Özeti) */}
          {(form.hesapTuru || form.bakiye) && (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(21, 101, 192, 0.05)', border: '1px solid rgba(21, 101, 192, 0.2)', borderRadius: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#1565c0', fontWeight: 600 }}>Hesap Özeti</Typography>
                {form.hesapTuru && <Typography variant="body2" color="text.secondary">• Hesap Türü: {hesapTurleri.find(t => t.id === form.hesapTuru)?.label}</Typography>}
                
                {form.hesapTuru === 'vadeli' && (form.vadeSuresi !== '' || customFaizOrani !== '') && (
                  <>
                    {form.vadeSuresi && form.vadeSuresi !== 'custom' && <Typography variant="body2" color="text.secondary">• Vade Süresi: {form.vadeSuresi} Gün</Typography>}
                    {form.vadeSuresi === 'custom' && <Typography variant="body2" color="text.secondary">• Vade Süresi: Özel Giriş</Typography>}
                    {/* Faiz oranı gösterimi */}
                    {form.vadeSuresi === 'custom' ? (
                      <Typography variant="body2" color="text.secondary">• Faiz Oranı: %{parseFloat(customFaizOrani).toFixed(2)}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">• Faiz Oranı: %{getFaizOrani().toFixed(2)}</Typography>
                    )}
                    
                    {/* Vade sonu tutarı gösterimi */}
                    {form.bakiye && parseFloat(form.bakiye) > 0 && (
                      <>
                        <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600, mt: 1 }}>
                          • Vade Sonu Tutarı: {calculateMaturityAmount().toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {form.dovizKodu}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
                          • Toplam Kazanç: {calculateInterestEarned().toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {form.dovizKodu}
                        </Typography>
                        {form.dovizKodu !== 'TRY' && convertedBalance && (
                          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500, fontSize: '0.875rem' }}>
                            • Vade Sonu TL Karşılığı: ₺{(calculateMaturityAmount() * exchangeRate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        )}
                      </>
                    )}
                  </>
                )}
                
                {form.dovizKodu && form.bakiye && (
                   <Typography variant="body2" color="text.secondary">• Başlangıç Bakiyesi: {parseFloat(form.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {form.dovizKodu}</Typography>
                )}

                {convertedBalance && form.dovizKodu !== 'TRY' && (
                  <Typography variant="body2" sx={{color: '#1565c0', mt: 1, fontWeight: 500}}>
                    • Yaklaşık TL Karşılığı: ₺{convertedBalance}
                  </Typography>
                )}
                 {exchangeRate !== null && form.dovizKodu !== 'TRY' && (
                    <Typography variant="caption" color="text.secondary" display="block">
                       (Kur: 1 {form.dovizKodu} = {exchangeRate.toLocaleString('tr-TR', { minimumFractionDigits: 4 })} TRY)
                    </Typography>
                 )}
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {/* Gönder Butonu - Ayrı bir bölüm olarak */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained" 
            onClick={handleSubmit} 
            size="large"
            sx={{
              py: 2, 
              px: 6,
              borderRadius: 3, 
              fontSize: '1.2rem', 
              fontWeight: 700, 
              textTransform: 'none',
              background: 'linear-gradient(45deg,rgb(67, 166, 190) 30%,rgb(12, 71, 119) 90%)',
              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
              minWidth: '200px',
              '&:hover': {
                background: 'linear-gradient(45deg,rgb(176, 181, 187) 30%,rgb(53, 137, 206) 90%)',
                boxShadow: '0 12px 35px rgba(40, 111, 182, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Hesap Oluştur
          </Button>
        </Box>
      </Paper>

      {/* Bildirim Alanı (Snackbar) */}
      <Snackbar
        open={snackbar.open} autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default HesapOlustur;