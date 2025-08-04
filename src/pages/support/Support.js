import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import EmailIcon from '@mui/icons-material/Email';
import ArticleIcon from '@mui/icons-material/Article';
import ChatIcon from '@mui/icons-material/Chat';

export default function Support() {
  const faqItems = [
    {
      question: 'Şifremi nasıl değiştirebilirim?',
      answer: 'Profil menüsünden "Şifre Değiştir" seçeneğine tıklayarak şifrenizi güncelleyebilirsiniz. Yeni şifreniz en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.'
    },
    {
      question: 'Yeni müşteri kaydını nasıl oluşturabilirim?',
      answer: 'Ana menüden "Yeni Müşteri Kaydı" butonuna tıklayarak müşteri kayıt formuna ulaşabilirsiniz. Tüm zorunlu alanları doldurduktan sonra kaydı tamamlayabilirsiniz.'
    },
    {
      question: 'Müşteri bilgilerini nasıl güncelleyebilirim?',
      answer: 'Müşteri sorgulama ekranından ilgili müşteriyi bulup "Müşteri Detay" sayfasına giderek bilgileri güncelleyebilirsiniz.'
    },
    {
      question: 'Yeni hesap açma işlemini nasıl yapabilirim?',
      answer: 'Müşteri detay sayfasında "Yeni Hesap Aç" butonunu kullanarak farklı para birimlerinde hesap açabilirsiniz.'
    },
    {
      question: 'İşlem geçmişini nasıl görüntüleyebilirim?',
      answer: 'Müşteri hesap detaylarında "İşlem Geçmişi" sekmesini kullanarak tüm işlemleri tarih aralığına göre filtreleyebilirsiniz.'
    },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'rgba(233, 247, 250, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <HelpIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
              Yardım ve Destek
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sık sorulan sorular ve destek kanalları
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          Sık Sorulan Sorular
        </Typography>

        {faqItems.map((item, index) => (
          <Accordion 
            key={index}
            sx={{ 
              mb: 1,
              '&:before': { display: 'none' },
              background: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                '&:hover': { background: 'rgba(25, 118, 210, 0.04)' }
              }}
            >
              <Typography sx={{ fontWeight: 500 }}>
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Daha Fazla Destek için:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<EmailIcon />} 
            href="mailto:destek@bankasistemi.com"
            sx={{ 
              justifyContent: 'flex-start', 
              py: 1.5, 
              textTransform: 'none', 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            destek@bankasistemi.com
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 