// src/App.js

import React from 'react'; // React'ı import etmek iyi bir pratiktir
import { Routes, Route, Navigate } from 'react-router-dom';

// Component/Page importlarınızın doğru yollarda olduğundan emin olun
// Örnek yollar: src/components/ ve src/pages/ klasörleri için
import Login from './components/Login';
import Home from './components/Home';
import YeniMusteri from './pages/YeniMusteri';
import HesapIslemleri from './pages/HesapIslemleri';
// MusteriSorgu için 'sorgula.js' dosyasının 'pages' klasöründe olduğunu varsaydım
import MusteriSorgu from './pages/sorgula';
import HesapOlustur from './pages/HesapOlustur';
import MusteriDetay from './pages/MusteriDetay'; // 'pages' klasöründe olduğunu varsaydım
// TransactionList ve TransactionAdd için 'pages' klasöründe olduğunu varsaydım
import TransactionList from './pages/TransactionList';
import TransactionAdd from './pages/TransactionAdd';
// TransactionHistory component'ini de import edelim
import TransactionHistory from './pages/TransactionHistory';
// AllTransactions component'ini de import edelim (güvenli tüm işlemler görüntüleme)
import AllTransactions from './pages/AllTransactions';
// Profil ve şifre için 'pages/profile' ve 'pages/password' klasörlerinde olduğunu varsaydım
import Profile from './pages/profile/Profile';
import ChangePassword from './pages/password/ChangePassword';
// Support için 'pages/support' klasöründe olduğunu varsaydım
import Support from './pages/support/Support';

function App() {
  return (
    // BrowserRouter bu component'i sarmalamalıdır (genellikle index.js'te yapılır).
    // Eğer burada değilse, index.js dosyanızda aşağıdaki gibi olmalı:
    // import ReactDOM from 'react-dom/client';
    // import { BrowserRouter } from 'react-router-dom';
    // import App from './App';
    //
    // const root = ReactDOM.createRoot(document.getElementById('root'));
    // root.render(
    //   <React.StrictMode>
    //     <BrowserRouter>
    //       <App />
    //     </BrowserRouter>
    //   </React.StrictMode>
    // );

    <Routes>
      {/* Ana URL'den (/) otomatik olarak /login sayfasına yönlendirme */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Uygulamanızdaki tüm tanımlı rotalar */}
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/new-customer" element={<YeniMusteri />} />
      <Route path="/hesap-islemleri" element={<HesapIslemleri />} />
      {/* MusteriSorgu için rotayı güncelledim */}
      <Route path="/musteri-sorgu" element={<MusteriSorgu />} />
      <Route path="/hesap-olustur" element={<HesapOlustur />} />
      {/* TransactionAdd'in accountId'yi nasıl alacağını bilmediğim için rotayı değiştirmedim */}
      <Route path="/transaction-add" element={<TransactionAdd />} />

      {/* Müşteri Detay sayfası rotası (dinamik ID ile) */}
      <Route path="/customer-details/:id" element={<MusteriDetay />} />

      {/* TransactionHistory rotası, TCKN parametresi ile */}
      <Route path="/transaction-history/:tckn" element={<TransactionHistory />} />
      
      {/* TransactionList rotası, accountId parametresi ile */}
      <Route path="/transactions/:accountId" element={<TransactionList />} />
      
      {/* Tüm işlemleri görüntüleme rotası (güvenli) */}
      <Route path="/all-transactions" element={<AllTransactions />} />

      {/* Yeni profil sayfaları */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/support" element={<Support />} />
      

      {/* Diğer rotalarınız burada listelenebilir */}
    </Routes>
  );
}

export default App;