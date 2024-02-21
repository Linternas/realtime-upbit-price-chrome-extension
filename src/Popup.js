/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from 'react';
import FavoriteSettings from './FavoriteSettings';
import './Popup.css';

function setComma(Num) {
  Num += '';
  Num = Num.replace(/,/g, '');
  const x = Num.split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? '.' + x[1] : '';
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) x1 = x1.replace(rgx, '$1' + ',' + '$2');
  return x1 + x2;
}

function Popup() {
  const port = useRef(null);
  const [error, setError] = useState(null);
  const [coinData, setCoinData] = useState([]);
  const [coinPrices, setCoinPrices] = useState(new Map());
  const [favoriteCoins, setFavoriteCoins] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const settingsIcon = require('./images/svg/ic-settings.svg').default;

  useEffect(() => {
    fetchCoinList();

    chrome.storage.local.get(['favoriteCoins', 'showFavoritesOnly'], (result) => {
      setFavoriteCoins(result.favoriteCoins || []);
      setShowFavoritesOnly(result.showFavoritesOnly || false);
    });

    port.current = chrome.runtime.connect({ name: 'coinPopup' });

    return () => {
      if (port.current) {
        port.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (coinData.length === 0) {
      return;
    }

    chrome.runtime.sendMessage({ action: 'subscribe' }, (response) => {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'updateCoin') {
          try {
            const data = message.data;
            setCoinPrices((prevPrices) => {
              const newPrices = new Map(prevPrices);
              newPrices.set(data.code, Object.assign(newPrices.get(data.code), data));
              return newPrices;
            });
          } catch (e) {
            console.error('Error parsing message data:', e);
            setError('Error parsing data');
          }
        }
      });
    });
  }, [coinData]);

  const fetchCoinList = async () => {
    try {
      const response = await fetch('https://api.upbit.com/v1/market/all?isDetails=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const filteredData = data
        .filter((coin) => coin.market.startsWith('KRW-'))
        .map((coin) => ({
          market: coin.market,
          korean_name: coin.korean_name,
          english_name: coin.english_name,
        }));

      filteredData.forEach((coin) => {
        setCoinPrices((prevPrices) => {
          const newPrices = new Map(prevPrices);
          newPrices.set(coin.market, {
            code: coin.market,
            korean_name: coin.korean_name,
            trade_price: 0,
            signed_change_rate: 0,
            signed_change_price: 0,
            acc_trade_price_24h: 0,
            change: 'EVEN',
          });
          return newPrices;
        });
      });

      setCoinData(filteredData);
      chrome.runtime.sendMessage({ action: 'fetchCoinList', data: filteredData });
    } catch (error) {
      console.error('Error fetching coin list:', error);
    }
  };

  const onSettingsClose = () => {
    setShowSettings(false);
    chrome.storage.local.get(['favoriteCoins', 'showFavoritesOnly'], (result) => {
      setFavoriteCoins(result.favoriteCoins || []);
      setShowFavoritesOnly(result.showFavoritesOnly || false);
    });
  };

  const renderCoinList = () => {
    const sortedCoinData = Array.from(coinPrices.values()).sort((a, b) => b.acc_trade_price_24h - a.acc_trade_price_24h);

    return sortedCoinData
      .filter((coin) => !showFavoritesOnly || favoriteCoins.includes(coin.code))
      .filter((coin) => !searchQuery || coin.korean_name.includes(searchQuery))
      .map((priceData) => (
        <tr key={priceData.code} className={priceData.change === 'RISE' ? 'rise' : priceData.change === 'EVEN' ? 'even' : 'fall'}>
          <td className="name">
            <strong>{priceData.korean_name}</strong>
            <em>{priceData.code}</em>
          </td>
          <td className="price">
            <strong>{setComma(priceData.trade_price.toLocaleString())}</strong>
          </td>
          <td className="percent">
            <p>{(priceData.signed_change_rate * 100).toFixed(2)}%</p>
            <em>
              {priceData.change === 'FALL' ? '' : '+'}
              {setComma(priceData.signed_change_price)}
            </em>
          </td>
          <td className="tradecost">
            <p>{setComma((priceData.acc_trade_price_24h / 1000000).toFixed(0))}</p>
            <i>백만</i>
          </td>
        </tr>
      ));
  };

  return (
    <div className="App">
      {showSettings ? (
        <FavoriteSettings onClose={() => onSettingsClose()} />
      ) : (
        <header className="App-header">
          <div className="search-container">
            <span>
              <input type="text" id="searchInput" className="search" placeholder="코인명 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </span>

            <div className="setting-section">
              <label className="btn-favorite-on">
                <input
                  type="checkbox"
                  id="showFavoritesOnly"
                  checked={showFavoritesOnly}
                  onChange={(e) => {
                    setShowFavoritesOnly(e.target.checked);
                    chrome.storage.local.set({ showFavoritesOnly: e.target.checked });
                  }}
                />
                즐겨찾기한 코인만 보기
              </label>

              <img className="btn-settings" src={settingsIcon} alt="settings" onClick={() => setShowSettings(true)} />
            </div>
          </div>

          {error ? (
            <p>{error}</p>
          ) : (
            <div className="coin-table-container">
              <table id="coin-list-table">
                <thead></thead>
                <tbody>{renderCoinList()}</tbody>
              </table>
            </div>
          )}
        </header>
      )}
    </div>
  );
}

export default Popup;
