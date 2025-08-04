import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import HelpIcon from '@mui/icons-material/Help';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Home() {
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: null, EUR: null });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUsername(storedName);
    } else {
      navigate("/");
    }
    
    // Döviz kurlarını getir
    fetchExchangeRates();
  }, [navigate]);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
      const data = await response.json();
      
      // TRY bazında kurlar geldiği için tersini alıyoruz (1 USD = ? TRY)
      setExchangeRates({
        USD: (1 / data.rates.USD).toFixed(2),
        EUR: (1 / data.rates.EUR).toFixed(2)
      });
    } catch (error) {
      console.error('Döviz kurları alınamadı:', error);
      setExchangeRates({ USD: 'N/A', EUR: 'N/A' });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    navigate("/");
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleChangePassword = () => {
    handleClose();
    navigate('/change-password');
  };

  const handleSupport = () => {
    handleClose();
    navigate('/support');
  };

  return (
    <Box sx={{ 
      minHeight: '90vh',
      position: 'relative',
      pb: 25,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("https://www.ziraatbank.com.tr/PublishingImages/Subpage/bankamiz/BankamizGorselleri/ifm-2.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(6.5px) brightness(0.95)',
        transform: 'scale(1.12)',
        zIndex: -1
  
      },

      '&::after': {         
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.35) 100%)',
        backdropFilter: 'blur(1px)',
        zIndex: -1
      }
    }}>
      <AppBar position="static" sx={{ 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg">
          <Toolbar>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexGrow: 1000
            }}>
              <Box
                component="img"
                src="https://www.ziraatbank.com.tr/PublishingImages/Subpage/bankamiz/BankamizGorselleri/Ziraat_Bankasi_Logo_JPEG.jpg"
                alt="Ziraat Bankası Logo"
                sx={{ 
                  height: 55,
                  width: 'auto',
                  mr: 3
                }}
              />
              <Typography sx={{ 
                 fontSize: '24px',        // Özel boyut
                 color: 'black',
                 fontWeight: 600,
                 mr: 20,
                 fontFamily: 'serif'
                }}>

                Ziraat Bankası
              </Typography >
              <Typography variant="h5" sx={{ 
                color: 'black',
                fontWeight: 700
              }}>
                Banka Yönetim Sistemi
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center',   justifyContent: 'space-between',gap: 5 }}>
              {/* Döviz Kurları */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                padding: '2px 4px',
                borderRadius: '30px',
                border: '1px solid rgba(25, 118, 210, 0.2)',
                marginRight: '10px'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'black', fontWeight: 600, display: 'block' }}>
                    USD
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'red', fontWeight: 700 }}>
                    {loading ? '...' : `₺${exchangeRates.USD}`}
                  </Typography>
                </Box>
                <Box sx={{ width: '1px', height: '30px', backgroundColor: 'rgba(25, 118, 210, 0.3)' }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'black', fontWeight: 600, display: 'block' }}>
                    EUR
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'red', fontWeight: 700 }}>
                    {loading ? '...' : `₺${exchangeRates.EUR}`}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                onClick={handleClick}
                color="primary"
                endIcon={<ArrowDropDownIcon />}
                startIcon={
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      marginRight: '7px',
                      
                      bgcolor: 'rgba(65, 161, 199, 0.56)',
                      fontSize: '0.875rem'
                    }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </Avatar>
                }
                sx={{
                  textTransform: 'none',
                  color: 'black',
                  fontSize: '16px',  
                  fontWeight: 700,
                  marginRight: 'auto',
               
                  '&:hover': {
                    backgroundColor: 'rgba(163, 239, 241, 0.68)'
                  }
                }}
              >
                {username}
              </Button>
              
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    },
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>👤 Profilim</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={handleChangePassword}>
                  <ListItemIcon>
                    <KeyIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>🔑 Şifre Değiştir</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={handleSupport}>
                  <ListItemIcon>
                    <HelpIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>🛟 Destek</ListItemText>
                </MenuItem>
                
                <Divider sx={{ my: 1, mx: 2 }} />
                
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>🚪 Çıkış Yap</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(400px)',
          borderRadius: 4,
          p: 3,
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)'
        }}>
          <Typography variant="h4" sx={{ 
            color: 'black',
            fontWeight: 700,
            mb: 2,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Hoş Geldiniz🖐️ {username}
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: '#1976d2',
            fontWeight: 500,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Banka Yönetim Sistemine başarıyla giriş yaptınız✔️
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ 
          p: 4, 
          textAlign: "center",
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(400px)',
          maxWidth: '800px',
          margin: '0 auto',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)'
        }}>
          <Typography variant="h4" gutterBottom sx={{ 
            color: 'black',
            fontWeight: 700,
            mb: 4,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            İşlem Menüsü💲
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/new-customer')}
                sx={{
                  py: 3,
                  background: 'linear-gradient(45deg,rgb(163, 228, 170) 30%,rgb(233, 114, 114) 90%)',
                  color: 'black',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg,rgb(233, 113, 123) 30%,rgb(100, 122, 246) 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgb(0, 0, 0)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Yeni Müşteri Kaydı
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AccountBalanceIcon />}
                onClick={() => navigate('/hesap-islemleri')}
                sx={{
                  py: 3,
                  background: 'linear-gradient(45deg,rgb(207, 114, 161) 30%,rgb(255, 255, 255) 90%)',
                  color: 'black',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg,rgb(69, 191, 228) 30%,rgb(10, 13, 10) 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Hesap İşlemleri
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/musteri-sorgu')}
                sx={{
                  py: 3,
                  background: 'linear-gradient(45deg,rgb(110, 197, 238) 30%,rgb(214, 157, 219) 90%)',
                  color: 'black',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg,rgb(139, 194, 87) 30%,rgb(117, 205, 205) 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(29, 26, 26, 0.77)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Müşteri Sorgulama
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}