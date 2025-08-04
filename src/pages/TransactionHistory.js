// src/pages/TransactionHistory.js
import React, { useEffect, useState } from 'react';
// useParams ve Link importunu kontrol edin
import { useParams, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert
} from '@mui/material';

function TransactionHistory() {
  const { tckn } = useParams(); // URL'den TCKN'yi al
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Backend'den TCKN'ye göre işlem geçmişini çekecek endpoint
        const response = await fetch(`http://localhost:3001/api/transaction-history/${tckn}`);

        if (!response.ok) {
          const errorData = await response.json();
          // Backend'den gelen hata mesajını daha iyi göstermek için
          throw new Error(errorData.message || errorData.errorDetails || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setHistoryData(data);

      } catch (err) {
        console.error('İşlem geçmişi getirilirken hata:', err);
        setError(err.message || 'İşlem geçmişi verileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    if (tckn) {
      fetchTransactionHistory();
    } else {
      setError("Lütfen geçerli bir TCKN ile bu sayfaya gelin.");
      setLoading(false);
    }
  }, [tckn]); // TCKN değiştiğinde yeniden çek

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', minHeight: '100vh' }}>
      <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 4, background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 24px 0 rgba(21,101,192,0.10)' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>
          Müşteri İşlem Geçmişi
        </Typography>
        {historyData.length > 0 ? (
          <Typography variant="h6" align="center" sx={{ mb: 3, color: '#555' }}>
            {historyData[0].FirstName} {historyData[0].LastName} (TCKN: {tckn})
          </Typography>
        ) : (
          <Typography variant="h6" align="center" sx={{ mb: 3, color: '#555' }}>
            Bu TCKN'ye ait işlem geçmişi bulunamadı.
          </Typography>
        )}
      </Paper>

      {historyData.length > 0 ? (
        <TableContainer component={Paper} elevation={5} sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(21,101,192,0.10)', background: 'rgba(255,255,255,0.98)' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Müşteri Adı</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Müşteri Soyadı</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Hesap ID</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>İşlem Türü</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tutar</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>İşlem Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.map((item) => (
                <TableRow key={`${item.AccountID}-${item.TransactionDate}`} hover sx={{ '&:hover': { background: '#e3f2fd' } }}>
                  <TableCell>{item.FirstName}</TableCell>
                  <TableCell>{item.LastName}</TableCell>
                  <TableCell>{item.AccountID}</TableCell>
                  <TableCell>{item.TransactionType}</TableCell>
                  {/* Tutarı para formatına çevirme */}
                  <TableCell>{typeof item.Amount === 'number' ? item.Amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : item.Amount}</TableCell>
                  <TableCell>{new Date(item.TransactionDate).toLocaleString('tr-TR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 3, mt: 4, textAlign: 'center', color: '#888' }}>
          Bu TCKN ile eşleşen işlem kaydı bulunamadı.
        </Box>
      )}
    </Box>
  );
}

export default TransactionHistory;