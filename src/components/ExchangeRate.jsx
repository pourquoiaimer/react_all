import React, { useState, useEffect } from 'react';

const ExchangeRate = () => {
    const [rates, setRates] = useState(null);
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('TWD');
    const [result, setResult] = useState(null);
    const [currentRate, setCurrentRate] = useState(null);

    const currencyNames = {
        'USD': '美金(USD)',
        'TWD': '台幣(TWD)',
        'JPY': '日幣(JPY)',
        'EUR': '歐元(EUR)',
        'CNY': '人民幣(CNY)',
        'HKD': '港幣(HKD)',
    };

    useEffect(() => {
        // Using ExchangeRate-API
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(response => response.json())
            .then(data => {
                if (data && data.rates) {
                    setRates(data.rates);
                } else {
                    console.error('Could not fetch exchange rates.');
                }
            })
            .catch(error => {
                console.error('Error fetching exchange rates:', error);
            });
    }, []);

    // Effect for automatic conversion and rate display
    useEffect(() => {
        if (rates && rates[fromCurrency] && rates[toCurrency]) {
            const rate = rates[toCurrency] / rates[fromCurrency];
            setCurrentRate(rate.toFixed(6));
            setResult((amount * rate).toFixed(4));
        } else {
            setCurrentRate(null);
            setResult(null);
        }
    }, [amount, fromCurrency, toCurrency, rates]);


    return (
        <div>
            <h2>匯率計算</h2>
            <h4>匯率來源: <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a> (以美金為基礎)</h4>
            <div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ margin: '0 5px' }}
                />
                <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} style={{ margin: '0 5px' }}>
                    {Object.keys(currencyNames).map(currency => (
                        <option key={currency} value={currency}>{currencyNames[currency]}</option>
                    ))}
                </select>
                <span style={{ margin: '0 5px' }}>到</span>
                <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} style={{ margin: '0 5px' }}>
                    {Object.keys(currencyNames).map(currency => (
                        <option key={currency} value={currency}>{currencyNames[currency]}</option>
                    ))}
                </select>
            </div>

            {rates ? (
                <>
                    {currentRate && !isNaN(currentRate) && (
                        <p style={{ marginTop: '15px' }}>
                            <strong>目前匯率:</strong> 1 {fromCurrency} = {currentRate} {toCurrency}
                        </p>
                    )}
                    {result && <h3>{amount} {currencyNames[fromCurrency]} = {result} {currencyNames[toCurrency]}</h3>}
                </>
            ) : (
                <p>匯率載入中...</p>
            )}
        </div>
    );
};

export default ExchangeRate;
