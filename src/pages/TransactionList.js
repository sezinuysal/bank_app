import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Table, TableHead, TableRow, TableCell, TableBody, Typography, 
  Paper, CircularProgress, Alert, Chip, Box 
} from '@mui/material';

const TransactionList = () => {
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AccountID:', accountId); // DEBUG
    
    if (!accountId) {
      setError('Hesap ID bulunamadı');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:3001/api/transactions/${accountId}`)
      .then(res => {
        console.log('Response status:', res.status); // DEBUG
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Gelen veri:', data); // DEBUG
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        } else {
          setError('Beklenmeyen veri formatı: ' + JSON.stringify(data));
          setTransactions([]);
        }
        setError(null);
      })
      .catch(err => {
        console.error("İşlem verileri alınamadı:", err);
        setError('İşlem verileri alınamadı: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accountId]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'Para Yatırma💰': return 'success';
      case 'Para Çekme📤': return 'error';
      case 'Transfer🔁': return 'info';
      case 'Fatura Ödeme🔁': return 'warning';
      case 'Faiz İşlemi📈': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>İşlemler yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        İşlem Geçmişi - Hesap #{accountId}
      </Typography>
      
      {transactions.length === 0 ? (
        <Alert severity="info">Bu hesap için henüz işlem bulunmamaktadır.</Alert>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Toplam {transactions.length} işlem bulundu
          </Typography>
          
          <Paper elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Hesap ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>İşlem Türü</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Tarih</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={tx.TransactionID || index} hover>
                    <TableCell>{tx.AccountID}</TableCell>
                    <TableCell>
                      <Chip
                        label={tx.TransactionType}
                        color={getTransactionTypeColor(tx.TransactionType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{tx.Description || '-'}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          color: tx.TransactionType === 'Para Yatırma' ? 'green' : 'red'
                        }}
                      >
                        {formatAmount(tx.Amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(tx.TransactionDate).toLocaleString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default TransactionList;