// src/pages/AllTransactions.js
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Chip, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function AllTransactions() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Tüm işlemleri getiren güvenli endpoint
        const response = await fetch('http://localhost:3001/api/all-transactions');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.errorDetails || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setAllTransactions(data);
        setFilteredTransactions(data);

      } catch (err) {
        console.error('Tüm işlemler getirilirken hata:', err);
        setError(err.message || 'Tüm işlem verileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, []);

  // Arama fonksiyonu
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTransactions(allTransactions);
    } else {
      const filtered = allTransactions.filter(item =>
        item.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.AccountID?.toString().includes(searchTerm) ||
        item.TransactionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.TCKN?.toString().includes(searchTerm)
      );
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, allTransactions]);

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'Para Yatırma': return 'success';
      case 'Para Çekme': return 'error';
      case 'Transfer': return 'info';
      case 'Fatura Ödeme': return 'warning';
      case 'Faiz İşlemi': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Tüm işlemler yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, mt: 5, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 5, p: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', minHeight: '100vh' }}>
      <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 4, background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 24px 0 rgba(21,101,192,0.10)' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>
          Tüm Müşteri İşlemleri
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 3, color: '#555' }}>
          Toplam {filteredTransactions.length} işlem ({allTransactions.length} toplam)
        </Typography>
        
        {/* Arama kutusu */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Müşteri adı, soyadı, hesap ID, işlem türü veya TCKN ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Paper>

      {filteredTransactions.length > 0 ? (
        <TableContainer component={Paper} elevation={5} sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(21,101,192,0.10)', background: 'rgba(255,255,255,0.98)' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>TCKN</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Müşteri Adı</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Müşteri Soyadı</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Hesap ID</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>İşlem Türü</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tutar</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>İşlem Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((item, index) => (
                <TableRow key={`${item.AccountID}-${item.TransactionDate}-${index}`} hover sx={{ '&:hover': { background: '#e3f2fd' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{item.TCKN}</TableCell>
                  <TableCell>{item.FirstName}</TableCell>
                  <TableCell>{item.LastName}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>{item.AccountID}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.TransactionType}
                      color={getTransactionTypeColor(item.TransactionType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    color: item.TransactionType === 'Para Yatırma' ? '#2e7d32' : '#d32f2f'
                  }}>
                    {typeof item.Amount === 'number' ? 
                      item.Amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : 
                      item.Amount
                    }
                  </TableCell>
                  <TableCell>{new Date(item.TransactionDate).toLocaleString('tr-TR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 3, mt: 4, textAlign: 'center', color: '#888' }}>
          {searchTerm ? 'Arama kriterlerinize uygun işlem bulunamadı.' : 'Henüz hiç işlem kaydı bulunmamaktadır.'}
        </Box>
      )}
    </Box>
  );
}

export default AllTransactions;
