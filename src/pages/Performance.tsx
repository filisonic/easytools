
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generatePriceHistory } from '@/utils/stocksApi';

const Performance = () => {
  // Generate mock performance data
  const generatePerformanceData = () => [
    { date: 'Jan 1', portfolio: 0, market: 0 }
  ];
  
  const performanceData = generatePerformanceData();
  
  // Calculate performance metrics
  const initialPortfolio = performanceData[0].portfolio;
  const currentPortfolio = performanceData[performanceData.length - 1].portfolio;
  const totalReturn = ((currentPortfolio - initialPortfolio) / initialPortfolio) * 100;
  
  // Mock sector allocation data
  const sectorAllocation = [
    { name: 'Sector', value: 100 }
  ];
  
  return (
    <PageLayout title="Performance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, '']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="portfolio" 
                    name="Your Portfolio" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="market" 
                    name="S&P 500" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Initial Investment</p>
                <p className="text-xl font-bold">${initialPortfolio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-xl font-bold">${currentPortfolio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absolute Return</p>
                <p className={`text-xl font-bold ${(currentPortfolio - initialPortfolio) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${(currentPortfolio - initialPortfolio).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Sector Allocation</h2>
            <div className="space-y-4">
              {sectorAllocation.map((sector) => (
                <div key={sector.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{sector.name}</span>
                    <span className="font-medium">{sector.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${sector.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Returns (%)</h2>
            <div className="grid grid-cols-3 gap-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => {
                const returnValue = (Math.random() * 6) - 2;
                return (
                  <div key={month} className="text-center p-2">
                    <p className="text-xs text-muted-foreground">{month}</p>
                    <p className={`text-sm font-medium ${returnValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {returnValue >= 0 ? '+' : ''}{returnValue.toFixed(2)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Performance;
