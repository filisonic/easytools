import { useState, useEffect } from 'react';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  region: string;
  lastUpdated: Date;
}

export interface CurrencyPair {
  symbol: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  relatedSymbols?: string[];
}

export interface Cryptocurrency {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  supply: number;
  lastUpdated: Date;
}

export const mockStocks: Stock[] = [
  {
    symbol: 'TICK',
    name: 'Stock Name',
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
    lastUpdated: new Date()
  }
];

export const mockIndices: MarketIndex[] = [
  {
    symbol: 'INDEX',
    name: 'Index Name',
    value: 0,
    change: 0,
    changePercent: 0,
    region: 'Region',
    lastUpdated: new Date()
  }
];

export const mockCurrencies: CurrencyPair[] = [
  {
    symbol: 'CUR/PAIR',
    fromCurrency: 'CUR',
    toCurrency: 'PAIR',
    rate: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: new Date()
  }
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Potential Rate Cuts Later This Year',
    summary: 'The Federal Reserve indicated it may begin cutting interest rates later this year if inflation continues to moderate, according to minutes from the recent FOMC meeting.',
    source: 'Financial Times',
    url: '#',
    publishedAt: new Date(Date.now() - 3600000 * 2),
    relatedSymbols: ['SPX', 'DJI']
  },
  {
    id: '2',
    title: 'Apple Announces New AI Features for iPhone',
    summary: 'Apple unveiled new AI capabilities for the upcoming iPhone models at its annual developer conference, highlighting privacy-focused on-device processing.',
    source: 'Tech Insider',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1470&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 3600000 * 5),
    relatedSymbols: ['AAPL']
  },
  {
    id: '3',
    title: 'NVIDIA Surpasses $2 Trillion Market Cap on AI Chip Demand',
    summary: 'NVIDIA\'s stock reached new heights, pushing its market cap above $2 trillion as demand for AI chips continues to exceed expectations.',
    source: 'Market Watch',
    url: '#',
    publishedAt: new Date(Date.now() - 3600000 * 8),
    relatedSymbols: ['NVDA']
  },
  {
    id: '4',
    title: 'Oil Prices Drop Amid Concerns of Slowing Global Demand',
    summary: 'Crude oil prices fell more than 2% on Thursday as investors weighed reports suggesting slower-than-expected global economic growth.',
    source: 'Energy Report',
    url: '#',
    publishedAt: new Date(Date.now() - 3600000 * 10),
  },
  {
    id: '5',
    title: 'Tesla Deliveries Beat Estimates Despite EV Market Slowdown',
    summary: 'Tesla reported quarterly deliveries that exceeded analyst expectations, bucking the trend of a broader slowdown in electric vehicle sales.',
    source: 'Auto Insights',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1632&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 3600000 * 12),
    relatedSymbols: ['TSLA']
  }
];

export const mockCryptos: Cryptocurrency[] = [
  {
    symbol: 'CRYP',
    name: 'Crypto',
    price: 0,
    change: 0,
    changePercent: 0,
    marketCap: 0,
    volume: 0,
    supply: 0,
    lastUpdated: new Date()
  }
];

export function generatePriceHistory(days: number = 30, startPrice: number = 100, volatility: number = 2): number[] {
  const prices: number[] = [startPrice];
  
  for (let i = 1; i < days; i++) {
    const change = (Math.random() - 0.5) * volatility;
    const newPrice = Math.max(prices[i-1] * (1 + change / 100), 0.1);
    prices.push(parseFloat(newPrice.toFixed(2)));
  }
  
  return prices;
}

export function formatNumber(num: number): string {
  if (num >= 1000000000000) {
    return `$${(num / 1000000000000).toFixed(2)}T`;
  }
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

export function formatPercentage(num: number): string {
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  
  if (diffInSec < 60) {
    return 'Just now';
  } else if (diffInMin < 60) {
    return `${diffInMin}m ago`;
  } else if (diffInHour < 24) {
    return `${diffInHour}h ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function useStockData(initialData: Stock[], updateInterval = 5000) {
  const [stocks, setStocks] = useState<Stock[]>(initialData);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const changeAmount = (Math.random() - 0.5) * (stock.price * 0.01);
          const newPrice = Math.max(stock.price + changeAmount, 0.01);
          const newChange = stock.change + changeAmount;
          const newChangePercent = (newChange / (newPrice - newChange)) * 100;
          
          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
            lastUpdated: new Date()
          };
        })
      );
    }, updateInterval);
    
    return () => clearInterval(intervalId);
  }, [initialData, updateInterval]);
  
  return stocks;
}

export function useMarketIndices(initialData: MarketIndex[], updateInterval = 8000) {
  const [indices, setIndices] = useState<MarketIndex[]>(initialData);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndices(prevIndices => 
        prevIndices.map(index => {
          const changeAmount = (Math.random() - 0.5) * (index.value * 0.0015);
          const newValue = Math.max(index.value + changeAmount, 0.01);
          const newChange = index.change + changeAmount;
          const newChangePercent = (newChange / (newValue - newChange)) * 100;
          
          return {
            ...index,
            value: parseFloat(newValue.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
            lastUpdated: new Date()
          };
        })
      );
    }, updateInterval);
    
    return () => clearInterval(intervalId);
  }, [initialData, updateInterval]);
  
  return indices;
}

export function useCurrencyPairs(initialData: CurrencyPair[], updateInterval = 10000) {
  const [currencies, setCurrencies] = useState<CurrencyPair[]>(initialData);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrencies(prevCurrencies => 
        prevCurrencies.map(currency => {
          const changeAmount = (Math.random() - 0.5) * (currency.rate * 0.0008);
          const newRate = Math.max(currency.rate + changeAmount, 0.0001);
          const newChange = currency.change + changeAmount;
          const newChangePercent = (newChange / (newRate - newChange)) * 100;
          
          return {
            ...currency,
            rate: parseFloat(newRate.toFixed(4)),
            change: parseFloat(newChange.toFixed(4)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
            lastUpdated: new Date()
          };
        })
      );
    }, updateInterval);
    
    return () => clearInterval(intervalId);
  }, [initialData, updateInterval]);
  
  return currencies;
}

export function useCryptoData(initialData: Cryptocurrency[], updateInterval = 7000) {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>(initialData);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCryptos(prevCryptos => 
        prevCryptos.map(crypto => {
          const volatilityFactor = crypto.symbol === 'BTC' || crypto.symbol === 'ETH' ? 0.005 : 0.012;
          const changeAmount = (Math.random() - 0.5) * (crypto.price * volatilityFactor);
          const newPrice = Math.max(crypto.price + changeAmount, 0.000001);
          const newChange = crypto.change + changeAmount;
          const newChangePercent = (newChange / (newPrice - newChange)) * 100;
          
          return {
            ...crypto,
            price: parseFloat(newPrice.toFixed(crypto.price < 1 ? 4 : 2)),
            change: parseFloat(newChange.toFixed(crypto.price < 1 ? 4 : 2)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
            lastUpdated: new Date()
          };
        })
      );
    }, updateInterval);
    
    return () => clearInterval(intervalId);
  }, [initialData, updateInterval]);
  
  return cryptos;
}
