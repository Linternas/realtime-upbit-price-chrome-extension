/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import './FavoriteSettings.css';

const FavoriteSettings = ({ onClose }) => {
  const starFilled = require('./images/svg/ic-star-filled.svg').default;
  const starEmpty = require('./images/svg/ic-star-empty.svg').default;
  const arrowBack = require('./images/svg/ic-arrow-back-ios.svg').default;

  const [coinData, setCoinData] = useState([]);
  const [favoriteCoins, setFavoriteCoins] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['favoriteCoins'], (result) => {
      setFavoriteCoins(result.favoriteCoins || []);
    });

    fetchCoinList();
  }, []);

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

      setCoinData(filteredData);
    } catch (error) {
      console.error('Error fetching coin list:', error);
    }
  };

  const toggleFavorite = (market) => {
    setFavoriteCoins((prevFavorites) => {
      const newFavorites = prevFavorites.includes(market) ? prevFavorites.filter((coin) => coin !== market) : [...prevFavorites, market];
      return newFavorites;
    });
  };

  const saveFavorites = () => {
    chrome.storage.local.set({ favoriteCoins });
    onClose();
  };

  return (
    <div className="favorite-setting-container">
      <img className="btn-back" src={arrowBack} alt="back" onClick={onClose} />

      <button onClick={saveFavorites}>저장</button>

      <ul>
        {coinData.map((coin) => (
          <li key={coin.market} onClick={() => toggleFavorite(coin.market)}>
            {favoriteCoins.includes(coin.market) ? <img src={starFilled} alt="star" /> : <img src={starEmpty} alt="star" />}

            <p>
              {coin.korean_name} ({coin.market})
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoriteSettings;
