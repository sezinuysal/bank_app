// index.js

const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const config = require('./sqlConfig'); // Kendi SQL konfigürasyon dosyanız
const AccountTypes = require('./accountTypes'); // Hesap tiplerini içeren dosyanız
const axios = require('axios'); // HTTP istekleri için
const xml2js = require('xml2js'); // XML ayrıştırmak için
const { parseStringPromise } = xml2js; // xml2js'ten parseStringPromise'ı kullanacağız
const cheerio = require('cheerio'); // HTML ayrıştırmak için

const app = express();
const PORT = 3001; // Backend'inizin çalışacağı port

// Middlewares
app.use(cors()); // Farklı domainlerden gelen istekleri kabul et
app.use(express.json()); // JSON body'lerini parse et

// MSSQL Bağlantı Havuzu Oluşturma
const poolPromise = sql.connect(config)
  .then(pool => {
    console.log('✅ MSSQL bağlantısı başarılı.');
    return pool;
  })
  .catch(err => {
    console.error('❌ MSSQL bağlantı hatası:', err);
    // Bağlantı hatası durumunda server'ın başlamaması istenebilir.
    // process.exit(1); // Bu satırı uncomment yaparak hata durumunda server'ı kapatabilirsiniz.
    return null; // Bağlantı olmasa da devam etmesini sağlayabiliriz, ancak hatalar oluşabilir.
  });

/* ========== LOGIN ENDPOINT'İ ========== */
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    if (!pool) { // Bağlantı yoksa hata döndür
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }

    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query(`
        SELECT FullName AS name
        FROM Users
        WHERE PersonelID = @username AND Password = @password
      `);

    if (result.recordset.length > 0) {
      // Giriş başarılıysa LastLogin alanını güncelle
      await pool.request()
        .input('username', sql.VarChar, username)
        .query(`
          UPDATE Users
          SET LastLogin = GETDATE()
          WHERE PersonelID = @username
        `);
      res.status(200).json({ name: result.recordset[0].name });
    } else {
      res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre.' });
    }
  } catch (err) {
    console.error('Login hatası:', err.message);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

/* ========== YENİ MÜŞTERİ EKLEME ENDPOINT'İ ========== */
app.post('/api/new-customer', async (req, res) => {
  const {
    TCKN, Ad, Soyad, DogumTarihi, Cinsiyet,
    Uyruk, BabaAdi, AnneAdi, Email, Telefon,
    Adres, SeriNo
  } = req.body;

  // Telefon numarası validasyonu - maksimum 20 karakter
  if (Telefon && Telefon.length > 20) {
    return res.status(400).json({ 
      message: 'Telefon numarası çok uzun. Maksimum 20 karakter olmalıdır.',
      currentLength: Telefon.length,
      maxLength: 20
    });
  }

  // Diğer alan validasyonları
  if (TCKN && TCKN.length > 11) {
    return res.status(400).json({ message: 'TCKN 11 karakterden uzun olamaz.' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }

    await pool.request()
      .input('TCKN', sql.NVarChar, TCKN)
      .input('FirstName', sql.NVarChar, Ad)
      .input('LastName', sql.NVarChar, Soyad)
      .input('BirthDate', sql.Date, DogumTarihi)
      .input('Gender', sql.NVarChar, Cinsiyet)
      .input('Nationality', sql.NVarChar, Uyruk)
      .input('FatherName', sql.NVarChar, BabaAdi)
      .input('MotherName', sql.NVarChar, AnneAdi)
      .input('Email', sql.NVarChar, Email)
      .input('Phone', sql.NVarChar, Telefon)
      .input('Address', sql.NVarChar, Adres)
      .input('IdentitySerial', sql.NVarChar, SeriNo)
      .query(`
        INSERT INTO Customers (
          TCKN, FirstName, LastName, BirthDate, Gender,
          Nationality, FatherName, MotherName, Email, Phone,
          Address, IdentitySerial
        )
        VALUES (
          @TCKN, @FirstName, @LastName, @BirthDate, @Gender,
          @Nationality, @FatherName, @MotherName, @Email, @Phone,
          @Address, @IdentitySerial
        );
      `);

    res.status(201).json({ message: 'Müşteri başarıyla eklendi!' });
  } catch (err) {
    console.error('Yeni müşteri ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
});

/* ========== HESAP OLUŞTURMA ENDPOINT'İ ========== */
app.post('/create-account', async (req, res) => {
  const { tckn, dovizKodu, bakiye, hesapTipi, faizOrani, ekNo, hesapAdi } = req.body;
  // Varsayılan faiz oranı değişkeni
  let finalFaizOrani = faizOrani;

  try {
    // Eğer hesap tipi VADELI ise merkez bankası politikasını baz alalım
    if (hesapTipi && hesapTipi.toUpperCase() === 'VADELI') {
      // Politika faizini çek
      const policyResp = await axios.get(`http://localhost:${PORT}/api/policy-rate`).catch(() => null);
      if (policyResp && policyResp.status === 200) {
        const { policyRate, minRate, maxRate } = policyResp.data;
        // Kullanıcı faiz göndermemişse politika faizini kullan
        if (typeof finalFaizOrani === 'undefined' || finalFaizOrani === null || finalFaizOrani === '') {
          // Eğer kullanıcı hiç faiz girmediyse, politika faizini kullan
          finalFaizOrani = policyRate;
        } else {
          // Girilen faiz sayıya çevrilmeye çalışılır
          const numericFaiz = parseFloat(finalFaizOrani);
          if (isNaN(numericFaiz)) {
            return res.status(400).json({ message: 'Girilen faiz oranı geçerli bir sayı olmalıdır.' });
          }
        
          // Faiz oranı, politika faizine göre belirlenen dinamik aralık içinde mi kontrol edilir
          const minAllowed = +(policyRate - 15).toFixed(2);
          const maxAllowed = +(policyRate + 5).toFixed(2);
        
          if (numericFaiz < minAllowed || numericFaiz > maxAllowed) {
            return res.status(400).json({
              message: `Girilen faiz oranı geçerli aralık dışında. (${minAllowed} - ${maxAllowed})`
            });
          }
        
          // Geçerli ise kullan
          finalFaizOrani = numericFaiz;
        }
        
      } else {
        console.warn('Politika faizi alınamadı, girilen faiz değişmeden kullanılacak.');
      }
    }

    // AccountTypes objesinden hesap tipini alıyoruz
    const hesapTipiInt = AccountTypes[hesapTipi.toUpperCase()];
    if (typeof hesapTipiInt === 'undefined') {
      return res.status(400).json({ message: 'Geçersiz hesap tipi. Mevcut tipler: ' + Object.keys(AccountTypes).join(', ') });
    }

    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }

    // Aynı müşteri, aynı suffix no ve aynı hesap türünde hesap kontrolü
    const existingAccountCheck = await pool.request()
      .input('TCKN', sql.NVarChar, tckn)
      .input('AccountSuffixNo', sql.Int, ekNo)
      .input('AccountType', sql.Int, hesapTipiInt)
      .query(`
        SELECT COUNT(*) as AccountCount
        FROM Accounts
        WHERE TCKN = @TCKN AND AccountSuffixNo = @AccountSuffixNo AND AccountType = @AccountType
      `);

    if (existingAccountCheck.recordset[0].AccountCount > 0) {
      return res.status(400).json({ 
        message: 'Bu müşteri için aynı suffix numarası ve hesap türünde zaten bir hesap bulunmaktadır.' 
      });
    }

    await pool.request()
      .input('TCKN', sql.NVarChar, tckn)
      .input('CurrencyCode', sql.NVarChar, dovizKodu)
      .input('Balance', sql.Decimal(18, 2), bakiye) // Bakiye için uygun tip ve hassasiyet
      .input('AccountType', sql.Int, hesapTipiInt)
      .input('InterestRate', sql.Decimal(18, 4), finalFaizOrani) // Faiz oranı için hassasiyeti artırdım (örn: %2.59 gibi)
      .input('AccountSuffixNo', sql.Int, ekNo)
      .input('AccountName', sql.NVarChar, hesapAdi)
      .query(`
        INSERT INTO Accounts (
          TCKN, CurrencyCode, Balance, AccountType, InterestRate, AccountSuffixNo, AccountName
        )
        VALUES (
          @TCKN, @CurrencyCode, @Balance, @AccountType, @InterestRate, @AccountSuffixNo, @AccountName
        );
      `);

    res.status(201).json({ message: 'Hesap başarıyla oluşturuldu.' });
  } catch (err) {
    console.error('Hesap oluşturma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
});


// index.js dosyana bu endpoint'i ekle

// Belirli bir hesabın işlem geçmişini getiren endpoint
app.get('/api/transactions/:accountId', async (req, res) => {
  const { accountId } = req.params;
  console.log('İşlem geçmişi istendi, AccountID:', accountId); // DEBUG
  
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }

    const result = await pool.request()
      .input('accountId', sql.Int, parseInt(accountId))
      .query(`
        SELECT 
          TransactionID,
          AccountID,
          TransactionType,S
          Amount,
          Description,
          TransactionDate
        FROM Transactions
        WHERE AccountID = @accountId
        ORDER BY TransactionDate DESC
      `);

    console.log(`${result.recordset.length} işlem bulundu`); // DEBUG
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('İşlem geçmişi getirilirken hata:', err);
    res.status(500).json({ message: 'İşlem geçmişi getirilirken bir hata oluştu: ' + err.message });
  }
});

app.get('/api/accounts', async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }

    const result = await pool.request()
      .query(`
        SELECT 
          a.AccountID,
          a.TCKN,
          a.CurrencyCode,
          a.Balance,
          a.AccountType,
          a.AccountSuffixNo,
          a.AccountName,
          c.FirstName,
          c.LastName
        FROM Accounts a
        LEFT JOIN Customers c ON a.TCKN = c.TCKN
        ORDER BY a.AccountID
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Hesaplar getirilirken hata:', err);
    res.status(500).json({ message: 'Hesaplar getirilirken bir hata oluştu.' });
  }
});
app.get('/api/customers', async (req, res) => {
  const { tckn, ad, soyad } = req.query;
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }
    // Hiçbir filtre yoksa boş dizi dön
    if (!tckn && !ad && !soyad) {
      return res.status(200).json([]);
    }
    let query = 'SELECT * FROM Customers WHERE 1=1';
    const request = pool.request();
    if (tckn) { query += ' AND TCKN = @tckn'; request.input('tckn', sql.NVarChar, tckn); }
    if (ad) { query += ' AND FirstName = @ad'; request.input('ad', sql.NVarChar, ad); }
    if (soyad) { query += ' AND LastName = @soyad'; request.input('soyad', sql.NVarChar, soyad); }
    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Müşteriler getirilirken hata:', err);
    res.status(500).json({ message: 'Müşteriler getirilirken bir hata oluştu.' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { AccountID, TransactionType, Amount, Description, TransactionDate } = req.body;
  try {
    const pool = await poolPromise;
    if (!pool) return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });

    await pool.request()
      .input('AccountID', sql.Int, AccountID)
      .input('TransactionType', sql.NVarChar, TransactionType)
      .input('Amount', sql.Decimal(18, 2), Amount)
      .input('Description', sql.NVarChar, Description)
      .input('TransactionDate', sql.DateTime, TransactionDate)
      .query(`
        INSERT INTO Transactions (AccountID, TransactionType, Amount, Description, TransactionDate)
        VALUES (@AccountID, @TransactionType, @Amount, @Description, @TransactionDate)
      `);

    res.status(201).json({ message: 'İşlem başarıyla eklendi.' });
  } catch (err) {
    console.error('İşlem eklenirken hata:', err);
    res.status(500).json({ message: 'İşlem eklenirken bir hata oluştu.' });
  }
});

/* ========== DÖVİZ KURU ÇEVİRME ENDPOINT'İ (Frankfurter API) ========== */
app.get('/api/exchange-rate', async (req, res) => {
  // Örn: /api/exchange-rate?from=USD&to=TRY&amount=100
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
      return res.status(400).json({ message: 'Lütfen kaynak (from), hedef (to) ve miktar (amount) parametrelerini sağlayın.' });
  }

  // Frankfurter API'sine istek atıyoruz. API anahtarı GEREKMEZ.
  const apiUrl = `https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${to.toUpperCase()}`;

  try {
      const response = await axios.get(apiUrl);
      const rates = response.data.rates;
      const targetRate = rates[to.toUpperCase()];

      if (!targetRate) {
          return res.status(404).json({ message: `Belirtilen hedef para birimi (${to.toUpperCase()}) bulunamadı veya desteklenmiyor.` });
      }

      // Amount'u number olarak alıp hesaplama yapalım
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
          return res.status(400).json({ message: 'Miktar (amount) geçerli bir sayı olmalıdır.' });
      }

      const convertedAmount = (numericAmount * targetRate).toFixed(2);

      res.status(200).json({
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          amount: numericAmount,
          rate: targetRate,
          convertedAmount: parseFloat(convertedAmount),
          last_update_utc: response.data.date // Bu API'de tarih bu alanda geliyor
      });

  } catch (error) {
      console.error('Döviz kuru alınırken hata (Frankfurter):', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'Döviz kuru servisine bağlanılamadı veya bir hata oluştu.' });
  }
});


/* ========== TCMB DÖVİZ KURLARI ENDPOINT'İ ========== */
app.get('/api/tcmb-rates', async (req, res) => {
  const tcmbUrl = "https://www.tcmb.gov.tr/kurlar/today.xml";
  // C# kodunuzdaki gibi hedef kurlar
  const targetCurrencyCodes = ["USD", "EUR", "GBP", "JPY", "AUD", "CHF", "DKK", "SEK", "CAD", "NOK", "SAR", "BGN", "RON", "RUB", "CNY", "AZN", "AED", "KRW"];

  try {
    // TCMB'den XML verisini çek
    const response = await axios.get(tcmbUrl);
    const xmlString = response.data;

    // XML'i JSON formatına çevir
    // xml2js.parseStringPromise doğrudan kullanılarak attribute'lar $ altında tutulur
    const result = await parseStringPromise(xmlString, {
      explicitArray: false, // Tek elemanlı dizileri nesne olarak almak için
      tagNameProcessors: [xml2js.processors.stripPrefix] // XML etiketlerindeki ön ekleri kaldırır
    });

    const rates = [];
    let lastUpdatedUtc = new Date(); // Varsayılan değer

    // Tarihi TCMB XML formatından parse etme (GG.AA.YYYY)
    const dateFromXmlAttr =
      result?.Tarih_Date?.$?.Date || // Yeni formatta "Date" attribute'u
      result?.Tarih_Date?.$?.Tarih || // Eski formatta "Tarih" attribute'u
      null;
    if (dateFromXmlAttr) {
      let parsedDate;
      if (dateFromXmlAttr.includes('.')) {
        // GG.AA.YYYY
        const [day, month, year] = dateFromXmlAttr.split('.');
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dateFromXmlAttr.includes('-')) {
        // YYYY-MM-DD
        const [year, month, day] = dateFromXmlAttr.split('-');
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        parsedDate = new Date(dateFromXmlAttr); // Fallback
      }
      lastUpdatedUtc = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));
    } else {
      // Tarih bilgisi gelmezse veya parse edilemezse, mevcut UTC tarihini kullan
      lastUpdatedUtc = new Date();
      console.warn('TCMB XML dosyasında tarih bilgisi bulunamadı veya parse edilemedi. Mevcut UTC tarihi kullanılıyor.');
    }

    // Currency node'unu işle
    if (result.Tarih_Date && result.Tarih_Date.Currency) {
      // Eğer tek bir döviz varsa da, bunu bir diziye çeviriyoruz ki döngü çalışsın.
      const currencies = Array.isArray(result.Tarih_Date.Currency) ? result.Tarih_Date.Currency : [result.Tarih_Date.Currency];

      for (const node of currencies) {
        const currencyCode = node?.$?.CurrencyCode || node?.$?.currencyCode;

        if (currencyCode && targetCurrencyCodes.includes(currencyCode)) {
          const forexSelling = node.ForexSelling; // Satış kuru
          const unit = node.Unit ? parseInt(node.Unit) : 1; // Birim bilgisi (örn: JPY için 100)

          if (forexSelling) {
            // TCMB XML'inde fiyatlar virgül ile ayrılmış olabilir, bunu noktaya çevirip parse edeceğiz.
            const rateString = forexSelling.replace(',', '.');
            const rate = parseFloat(rateString);

            if (!isNaN(rate)) {
              let normalizedRate = rate;
              // Eğer birim 1'den büyükse (örn: JPY için 100), fiyatı 1 birime normalize et.
              if (unit > 1) {
                normalizedRate = rate / unit;
              }

              rates.push({
                symbol: `${currencyCode}/TRY`, // Örneğin: USD/TRY
                price: normalizedRate,
                currency: "TRY", // Baz para birimi
                lastUpdated: lastUpdatedUtc // Döviz kurunun çekildiği tarih (UTC)
              });
            }
          }
        }
      }
    } else {
        console.warn('TCMB XML dosyasında Currency nodeları bulunamadı.');
    }

    // Başarılı döviz kurları listesini JSON olarak gönder
    res.status(200).json(rates);

  } catch (error) {
    console.error('TCMB döviz kurları alınırken hata:', error.message);
    // Hata durumunda kullanıcıya bilgi ver
    res.status(500).json({ message: 'TCMB döviz kurları servisine bağlanılamadı veya veri işlenirken bir hata oluştu.', errorDetails: error.message });
  }
});

/* ========== TCMB POLİTİKA (1 HAFTA REPO) FAİZ ORANI ENDPOINT'İ ========== */

// TCMB web sayfasındaki "Merkez Bankası Faiz Oranları" tablosundan güncel politika (1 hafta vadeli repo) faizini çeker.
// Kaynak sayfa TR sürümü kullanıldığı için satır metni "1 Hafta Repo" şeklindedir. Yapı değişirse EN sürümünde de "1 Week Repo" taranır.
app.get('/api/policy-rate', async (req, res) => {
  try {
    // TCMB'nin politika faizi tablosu (HTML) adresi
    const url = 'https://www.tcmb.gov.tr/wps/wcm/connect/tr/tcmb+tr/main+page+site+area/bugun';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    let policyRate = null;
    let minRate = null;
    let maxRate = null;
    // Türkçe ve İngilizce başlıkları kontrol et
    $("table:contains('1 Hafta Repo'), table:contains('1 Week Repo')").each((i, table) => {
      $(table).find('tr').each((j, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim();
          if (label.includes('1 Hafta Repo') || label.includes('1 Week Repo')) {
            const valueText = $(cells[1]).text().replace('%', '').replace(',', '.').trim();
            const value = parseFloat(valueText);
            if (!isNaN(value)) {
              policyRate = value;
              minRate = +(value - 15).toFixed(2);
              maxRate = +(value + 5).toFixed(2);
            }
          }
        }
      });
    });
    if (policyRate !== null) {
      res.status(200).json({ policyRate, minRate, maxRate });
    } else {
      res.status(404).json({ message: 'Politika faizi bulunamadı.' });
    }
  } catch (err) {
    console.error('Politika faizi alınırken hata:', err.message);
    res.status(500).json({ message: 'Politika faizi alınamadı.' });
  }
});

/* ========== ŞİFRE DEĞİŞTİRME ENDPOINT'İ ========== */
app.post('/api/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }

    // Önce eski şifreyi kontrol et
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, oldPassword)
      .query(`
        SELECT PersonelID
        FROM Users
        WHERE PersonelID = @username AND Password = @password
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(401).json({ message: 'Mevcut şifre hatalı.' });
    }

    // Şifreyi güncelle
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('newPassword', sql.NVarChar, newPassword)
      .query(`
        UPDATE Users
        SET Password = @newPassword
        WHERE PersonelID = @username
      `);

    res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    console.error('Şifre değiştirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
});

// Kullanıcı bilgisi getirme endpoint'i
app.get('/api/user/:id', async (req, res) => {
  const personelId = req.params.id;
  console.log('Profil isteği geldi, id:', personelId); // EKLENDİ
  try {
    const pool = await poolPromise;
    if (!pool) {
      console.error('Veritabanı bağlantısı yok!');
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }
    const result = await pool.request()
      .input('personelId', sql.NVarChar, personelId)
      .query(`
        SELECT PersonelID, FullName, Email, Role, LastLogin
        FROM Users
        WHERE PersonelID = @personelId
      `);
    if (result.recordset.length === 0) {
      console.warn('Kullanıcı bulunamadı:', personelId);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json({
      id: result.recordset[0].PersonelID,
      fullName: result.recordset[0].FullName,
      email: result.recordset[0].Email,
      role: result.recordset[0].Role,
      lastLogin: result.recordset[0].LastLogin
    });
  } catch (err) {
    console.error('Kullanıcı bilgisi alınırken hata:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
});

/* ========== SUNUCUYU BAŞLAT ========== */
app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
  // Eğer poolPromise başlangıçta null döndüyse, burada bir uyarı verebiliriz.
  if (!poolPromise) {
      console.warn('⚠️ Veritabanı bağlantısı kurulmamış olabilir.');
  }
});



app.get('/api/transaction-history/:tckn', async (req, res) => {
  const { tckn } = req.params; // URL'den TCKN'yi al

  if (!tckn) {
    return res.status(400).json({ message: 'TCKN bilgisi gereklidir.' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Veritabanına bağlanılamadı.' });
    }

    const request = pool.request();
    request.input('tckn', sql.NVarChar, tckn); // TCKN'yi parametre olarak ekle

    // Belirttiğiniz SQL sorgusu
    const query = `
      SELECT
        c.FirstName,
        c.LastName,
        a.AccountID,
        t.TransactionType,
        t.Amount,
        t.TransactionDate
      FROM Customers c
      LEFT JOIN Accounts a ON c.TCKN = a.TCKN
      LEFT JOIN Transactions t ON a.AccountID = t.AccountID
      WHERE c.TCKN = @tckn -- TCKN'ye göre filtrele
      ORDER BY c.FirstName, t.TransactionDate DESC -- İsim ve işlem tarihine göre sırala
    `;

    const result = await request.query(query);
    res.status(200).json(result.recordset);

  } catch (err) {
    console.error('TCKN işlem geçmişi getirilirken hata:', err);
    res.status(500).json({ message: 'İşlem geçmişi getirilirken bir hata oluştu.', errorDetails: err.message });
  }
});
