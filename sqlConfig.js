// sqlConfig.js
module.exports = {
  user: 'sezin',
  password: 'Sezin1234!',
  server: 'localhost',
  port: 1433,
  database: 'bankdb',
  // YENİ: Döviz kuru API anahtarı eklendi
  exchangeRateApiKey: '878c13fe8dc9bbc7d9e08cc120d454b4',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};