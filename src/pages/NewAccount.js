import React, { useEffect, useState } from 'react';

const [currencyCode, setCurrencyCode] = useState("TRY"); // Türk Lirası default
const [exchangeRate, setExchangeRate] = useState(1); // TRY için oran 1
useEffect(() => {
    if (currencyCode === "TRY") {
      setExchangeRate(1);
      return;
    }
  
    fetch(`https://api.exchangerate.host/latest?base=${currencyCode}&symbols=TRY`)
      .then((res) => res.json())
      .then((data) => {
        setExchangeRate(data.rates.TRY);
      })
      .catch((err) => {
        console.error("Döviz kuru alınamadı:", err);
        setExchangeRate(1); // fallback
      });
  }, [currencyCode]);

  
  const [amount, setAmount] = useState("");  // Kullanıcının girdiği döviz tutarı
const convertedAmount = amount * exchangeRate; // TL karşılığı otomatik hesap
{currencyCode !== "TRY" && (
    <p style={{ color: 'green', marginTop: '5px' }}>
      Güncel Tutar (TL): {convertedAmount.toFixed(2)} ₺
    </p>
  )}
  const handleSubmit = async () => {
    const dataToSend = {
      // diğer alanlar...
      Balance: currencyCode === "TRY" ? amount : convertedAmount,
      CurrencyCode: currencyCode,
    };
  
    // API'ye POST et
    await fetch("/api/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });
  };
<Select
  value={currencyCode}
  onChange={(e) => setCurrencyCode(e.target.value)}
>
  <MenuItem value="TRY">Türk Lirası</MenuItem>
  <MenuItem value="USD">Amerikan Doları</MenuItem>
  <MenuItem value="EUR">Euro</MenuItem>
</Select>
    