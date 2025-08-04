// TransactionAdd.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, MenuItem, TextField, Typography, Grid, Select, InputLabel, FormControl, Paper, Snackbar, Alert
} from '@mui/material';

const transactionTypes = [
  { value: 'Para Yatırma', label: 'Para Yatırma💰' },
  { value: 'Para Çekme', label: 'Para Çekme💲' },
  { value: 'Transfer', label: 'Hesaplar Arası Transfer💱' },
  { value: 'Fatura Ödeme', label: 'Fatura Ödemesi📰' },
  { value: 'Faiz İşlemi', label: 'Faiz İşlemi📈' },
];

const TransactionAdd = ({ accountId, accounts }) => {
  const [form, setForm] = useState({
    AccountID: '',
    TransactionType: '',
    Amount: '',
    Description: '',
    TransactionDate: new Date().toISOString().slice(0, 16),
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/accounts');
        if (response.ok) {
          const accountsData = await response.json();
          setAvailableAccounts(accountsData);
        }
      } catch (err) {
        console.error('Hesaplar yüklenirken hata:', err);
      }
    };

    if (!accounts || accounts.length === 0) {
      fetchAccounts();
    } else {
      setAvailableAccounts(accounts);
    }
  }, [accounts]);

  // availableAccounts geldiğinde ilk hesabı otomatik seç
  useEffect(() => {
    if (!form.AccountID && availableAccounts.length > 0) {
      setForm(prev => ({ ...prev, AccountID: availableAccounts[0].AccountID }));
    }
  }, [availableAccounts]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!form.AccountID) {
      setError('Lütfen bir hesap seçiniz!');
      setShowSnackbar(true);
      setLoading(false);
      return;
    }

    // Bakiye kontrolü için mevcut hesap bakiyesini al
    try {
      const balanceResponse = await fetch(`http://localhost:3001/api/accounts/${form.AccountID}/balance`);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        const currentBalance = balanceData.balance || 0;
        const transactionAmount = parseFloat(form.Amount);
        const BALANCE_LIMIT = 1000000000; // 1 milyar
        
        // Yeni bakiyeyi hesapla (Para Yatırma işleminde bakiye artar)
        let newBalance = currentBalance;
        if (form.TransactionType === 'Para Yatırma') {
          newBalance = currentBalance + transactionAmount;
        }
        
        // Bakiye limitini kontrol et
        if (newBalance > BALANCE_LIMIT) {
          setError(`UYARI: Bu işlem sonrası bakiye ${BALANCE_LIMIT.toLocaleString('tr-TR')} TL limitini aşacaktır! Mevcut bakiye: ${currentBalance.toLocaleString('tr-TR')} TL, İşlem sonrası bakiye: ${newBalance.toLocaleString('tr-TR')} TL olacaktır.`);
          setShowSnackbar(true);
          setLoading(false);
          return;
        }
      }
    } catch (balanceErr) {
      console.warn('Bakiye kontrolü yapılamadı:', balanceErr);
      // Bakiye kontrolü başarısız olsa da işleme devam et
    }

    try {
      const response = await fetch('http://localhost:3001/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          AccountID: parseInt(form.AccountID),
          TransactionType: form.TransactionType,
          Amount: parseFloat(form.Amount),
          Description: form.Description,
          TransactionDate: new Date(form.TransactionDate).toISOString(),
        }),
      });

      if (response.ok) {
        setSuccess('İşlem başarıyla eklendi!');
        setShowSnackbar(true);
        setForm({
          AccountID: availableAccounts[0]?.AccountID || '',
          TransactionType: '',
          Amount: '',
          Description: '',
          TransactionDate: new Date().toISOString().slice(0, 16),
        });
      } else {
        const errData = await response.json();
        // Bakiye limiti aşımı kontrolü
        if (errData.message && (errData.message.includes('balance') || errData.message.includes('limit') || errData.message.includes('milyar'))) {
          setError('Tutar 1 milyarı geçemez');
        } else {
          setError('İşlem eklenirken hata oluştu: ' + (errData.message || 'Bilinmeyen hata'));
        }
        setShowSnackbar(true);
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı: ' + err.message);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 4, md: 8 },
      px: 0,
    }}>
      <Paper
        elevation={8}
        sx={{
          maxWidth: 520,
          width: '100%',
          mx: 'auto',
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 8px 32px 0 rgba(21,101,192,0.10)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, color: '#1976d2', mb: 4 }}>
          Yeni İşlem Ekle
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Grid container spacing={3}>

            {/* Hesap Seçimi */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
                Hesap Seçimi
              </Typography>
              <FormControl fullWidth required variant="outlined">
                <Select
                  name="AccountID"
                  value={form.AccountID}
                  onChange={handleChange}
                  displayEmpty
                  sx={{ background: '#f4f8fb', borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    <em>Hesap Seçiniz...</em>
                  </MenuItem>
                  {availableAccounts.map((account) => (
                    <MenuItem key={account.AccountID} value={account.AccountID}>
                      {account.FirstName} {account.LastName} - {account.CurrencyCode} ({account.AccountID})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Diğer alanlar */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel shrink={true}>İşlem Türü</InputLabel>
                <Select
                  name="TransactionType"
                  value={form.TransactionType}
                  onChange={handleChange}
                  sx={{ background: '#f4f8fb', borderRadius: 2 }}
                  label="İşlem Türü"
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <em style={{ color: '#999' }}>İşlem Türü Seçiniz...</em>;
                    }
                    const selectedType = transactionTypes.find(type => type.value === selected);
                    return selectedType ? selectedType.label : selected;
                  }}
                >
                  {transactionTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Tutar"
                name="Amount"
                value={form.Amount}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                variant="outlined"
                sx={{ background: '#f4f8fb', borderRadius: 2 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="İşlem Tarihi"
                name="TransactionDate"
                type="datetime-local"
                value={form.TransactionDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{ background: '#f4f8fb', borderRadius: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                name="Description"
                value={form.Description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                sx={{ background: '#f4f8fb', borderRadius: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  borderRadius: 2,
                  py: 2,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)',
                  },
                }}
              >
                {loading ? 'Ekleniyor...' : 'İşlemi Tamamla'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {success ? (
            <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
          ) : null}
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default TransactionAdd;
