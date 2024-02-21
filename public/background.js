/* eslint-disable no-undef */
let socket;
let coinPrices = new Map();
let port = null;
let closeTimeout;

const connectWebSocket = () => {
  if (!socket) {
    socket = new WebSocket('wss://api.upbit.com/websocket/v1');
  } else {
    const subscribeMessage = [{ ticket: 'UNIQUE_TICKET' }, { type: 'ticker', codes: Array.from(coinPrices.keys()) }];
    socket.send(JSON.stringify(subscribeMessage));
  }

  socket.onopen = () => {
    if (socket) {
      const subscribeMessage = [{ ticket: 'UNIQUE_TICKET' }, { type: 'ticker', codes: Array.from(coinPrices.keys()) }];
      socket.send(JSON.stringify(subscribeMessage));
      return;
    }
  };

  socket.onmessage = async (event) => {
    try {
      event.data.arrayBuffer().then((buffer) => {
        const text = new TextDecoder('utf-8').decode(buffer);
        const data = JSON.parse(text);

        if (port) {
          chrome.runtime.sendMessage({ action: 'updateCoin', data });
        }
      });
    } catch (e) {
      console.error('Error parsing message data:', e);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket Error: ', error);
  };

  socket.onclose = (event) => {
    console.log('WebSocket connection closed', event);
    clearTimeout(closeTimeout);
    socket = null;
  };
};

const scheduleWebSocketClose = () => {
  clearTimeout(closeTimeout);
  closeTimeout = setTimeout(() => {
    if (socket) {
      socket.close();
      socket = null;
    }
  }, 60 * 1000 * 2);
};

chrome.runtime.onConnect.addListener((p) => {
  port = p;
  clearTimeout(closeTimeout);

  // 팝업이 닫힐 때 이벤트 실행됨
  // 크롬 확장프로그램은 팝업이 닫힐때 이벤트를 보장할 수 없기 때문에
  // 소켓 연결 해제를 2분 후에 실행하도록 한다.
  // 2분후에
  // 만약 그 안에 다시 팝업이 열린다면 clearTimeout을 통해 이벤트를 취소한다.
  port.onDisconnect.addListener(() => {
    port = null;

    if (socket) {
      // 소켓이 열려있다면 btc 시세만 받아오면서 소켓을 유지한다.
      socket.send(JSON.stringify([{ ticket: 'UNIQUE_TICKET' }, { type: 'ticker', codes: ['KRW-BTC'] }]));
      console.log('Unsubscribed from ticker');
    }

    if (socket) {
      scheduleWebSocketClose();
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchCoinList') {
    request.data.forEach((coin) => {
      coinPrices.set(coin.market, coin);
    });

    sendResponse({ success: true });

    return true; // 비동기 응답을 보낼 것임을 명시
  } else if (request.action === 'subscribe') {
    connectWebSocket();
    sendResponse({ success: true });
    return true;
  }
});
