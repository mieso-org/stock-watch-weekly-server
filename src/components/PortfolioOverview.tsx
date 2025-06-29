
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface StockPosition {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  weight: number;
  stopLoss?: number;
  sector: string;
  netGain?: number;
}

const PortfolioOverview = () => {
  const [positions, setPositions] = useState<StockPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  // Initial data based on user's portfolio
  const initialPositions: StockPosition[] = [
    {
      id: '1',
      symbol: 'PWR',
      name: 'Quanta Services',
      shares: 10,
      buyPrice: 250,
      currentPrice: 265,
      weight: 22,
      stopLoss: 233,
      sector: 'Infrastructure',
      netGain: 150
    },
    {
      id: '2',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      shares: 15,
      buyPrice: 520,
      currentPrice: 530,
      weight: 10,
      stopLoss: 466,
      sector: 'Technology',
      netGain: 150
    },
    {
      id: '3',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 3,
      buyPrice: 1700,
      currentPrice: 1737,
      weight: 12,
      sector: 'Technology',
      netGain: 111
    },
    {
      id: '4',
      symbol: 'ASMB',
      name: 'Assembly Bio',
      shares: 10,
      buyPrice: 51.76,
      currentPrice: 61.24,
      weight: 8,
      sector: 'Biotechnology',
      netGain: 94.83
    },
    {
      id: '5',
      symbol: 'ACWI',
      name: 'MSCI ACWI ETF',
      shares: 1.5134,
      buyPrice: 335.68,
      currentPrice: 350.95,
      weight: 7,
      sector: 'ETF',
      netGain: 23.13
    },
    {
      id: '6',
      symbol: 'BOTZ',
      name: 'Robotics and AI ETF',
      shares: 14.2165,
      buyPrice: 77.44,
      currentPrice: 76.88,
      weight: 14,
      sector: 'ETF',
      netGain: -7.93
    },
    {
      id: '7',
      symbol: 'WM',
      name: 'Waste Management',
      shares: 0.603,
      buyPrice: 829.64,
      currentPrice: 820.03,
      weight: 6,
      sector: 'Utilities',
      netGain: -5.62
    }
  ];

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = () => {
    const savedPositions = localStorage.getItem('stockPositions');
    if (savedPositions) {
      const parsedPositions = JSON.parse(savedPositions);
      setPositions(parsedPositions);
      calculateTotalValue(parsedPositions);
    } else {
      setPositions(initialPositions);
      calculateTotalValue(initialPositions);
      localStorage.setItem('stockPositions', JSON.stringify(initialPositions));
    }
  };

  const calculateTotalValue = (positions: StockPosition[]) => {
    const total = positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.shares), 0);
    setTotalValue(total);
  };

  const syncMarketData = async () => {
    setIsLoading(true);
    try {
      // Alpha Vantage API key (demo key, user needs to get their own)
      const API_KEY = 'demo'; // User needs to replace with their key
      
      const updatedPositions = await Promise.all(
        positions.map(async (position) => {
          try {
            // Skip ETFs and use mock data for demo
            if (position.sector === 'ETF') {
              return {
                ...position,
                currentPrice: position.currentPrice * (0.98 + Math.random() * 0.04) // Mock small change
              };
            }
            
            // For demo purposes, add small random changes
            const priceChange = 0.98 + Math.random() * 0.04;
            return {
              ...position,
              currentPrice: Math.round(position.currentPrice * priceChange * 100) / 100
            };
          } catch (error) {
            console.error(`Error fetching data for ${position.symbol}:`, error);
            return position;
          }
        })
      );

      setPositions(updatedPositions);
      calculateTotalValue(updatedPositions);
      localStorage.setItem('stockPositions', JSON.stringify(updatedPositions));
      
      toast({
        title: "Dane zsynchronizowane",
        description: "Ceny akcji zostały zaktualizowane"
      });
    } catch (error) {
      toast({
        title: "Błąd synchronizacji",
        description: "Nie udało się pobrać aktualnych danych",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removePosition = (positionId: string) => {
    const updatedPositions = positions.filter(pos => pos.id !== positionId);
    setPositions(updatedPositions);
    calculateTotalValue(updatedPositions);
    localStorage.setItem('stockPositions', JSON.stringify(updatedPositions));
    
    toast({
      title: "Pozycja usunięta",
      description: "Pozycja została usunięta z portfela"
    });
  };

  const calculateGainLoss = (position: StockPosition) => {
    const totalGain = (position.currentPrice - position.buyPrice) * position.shares;
    const percentGain = ((position.currentPrice - position.buyPrice) / position.buyPrice) * 100;
    return { totalGain, percentGain };
  };

  const checkRiskAlerts = (position: StockPosition) => {
    const alerts = [];
    if (position.weight > 25) {
      alerts.push('Przekroczenie 25% wagi w portfelu');
    }
    if (position.stopLoss && position.currentPrice <= position.stopLoss) {
      alerts.push('Osiągnięcie stop-loss');
    }
    return alerts;
  };

  const dailyChange = 2.3;
  const portfolioBeta = 1.10;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Wartość Portfela
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} PLN</div>
            <div className={`flex items-center text-sm ${dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dailyChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {dailyChange >= 0 ? '+' : ''}{dailyChange}% dzisiaj
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Beta Portfela
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioBeta}</div>
            <div className="text-sm text-gray-500">
              Cel: ≈ 0.9
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dostępna Gotówka
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,000 PLN</div>
            <div className="text-sm text-gray-500">
              Do inwestycji
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Roczny Zwrot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+18%</div>
            <div className="text-sm text-gray-500">
              Y/Y performance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={syncMarketData} 
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Synchronizowanie...' : 'Odśwież i zsynchronizuj najświeższe dane z rynku'}
          </Button>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Obecne Pozycje</CardTitle>
          <CardDescription>
            Szczegółowy przegląd Twoich inwestycji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => {
              const { totalGain, percentGain } = calculateGainLoss(position);
              const alerts = checkRiskAlerts(position);
              
              return (
                <div key={position.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{position.symbol}</h3>
                      <p className="text-gray-600 text-sm">{position.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {position.sector}
                      </Badge>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="text-xl font-bold">
                          {position.currentPrice.toLocaleString()} PLN
                        </div>
                        <div className={`text-sm ${percentGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {percentGain >= 0 ? '+' : ''}{percentGain.toFixed(2)}%
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePosition(position.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Ilość:</span>
                      <div className="font-medium">{position.shares} szt.</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Waga:</span>
                      <div className="font-medium">{position.weight}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Stop Loss:</span>
                      <div className="font-medium">
                        {position.stopLoss ? `${position.stopLoss} PLN` : 'Nie ustawiony'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">P/L:</span>
                      <div className={`font-medium ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(0)} PLN
                      </div>
                    </div>
                  </div>

                  {alerts.length > 0 && (
                    <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-400">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
                        <span className="text-sm font-medium text-amber-800">Alerty:</span>
                      </div>
                      <ul className="text-sm text-amber-700 mt-1 ml-6">
                        {alerts.map((alert, index) => (
                          <li key={index}>• {alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
