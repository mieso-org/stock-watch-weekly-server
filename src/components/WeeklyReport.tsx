
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, Target, Calendar, Download, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const WeeklyReport = () => {
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const syncReportData = () => {
    setIsLoading(true);
    
    // Get positions from localStorage
    const positions = JSON.parse(localStorage.getItem('stockPositions') || '[]');
    
    // Calculate portfolio metrics
    const totalValue = positions.reduce((sum: number, pos: any) => sum + (pos.currentPrice * pos.shares), 0);
    const totalCost = positions.reduce((sum: number, pos: any) => sum + (pos.buyPrice * pos.shares), 0);
    const portfolioReturn = ((totalValue - totalCost) / totalCost) * 100;
    
    // Find best and worst performers
    let bestPerformer = { symbol: 'N/A', return: 0 };
    let worstPerformer = { symbol: 'N/A', return: 0 };
    
    positions.forEach((pos: any) => {
      const posReturn = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice) * 100;
      if (posReturn > bestPerformer.return) {
        bestPerformer = { symbol: pos.symbol, return: posReturn };
      }
      if (posReturn < worstPerformer.return) {
        worstPerformer = { symbol: pos.symbol, return: posReturn };
      }
    });

    // Generate recommendations
    const recommendations = [];
    
    positions.forEach((pos: any) => {
      const gain = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice) * 100;
      
      if (gain > 10) {
        recommendations.push({
          type: 'action',
          priority: 'high',
          title: `Ustaw trailing stop na ${pos.symbol}`,
          description: `Akcja wzrosła o ${gain.toFixed(1)}% - rozważ trailing stop na poziomie 12% poniżej maksimum`,
          deadline: 'W ciągu tygodnia'
        });
      }
      
      if (pos.stopLoss && pos.currentPrice <= pos.stopLoss * 1.1) {
        recommendations.push({
          type: 'watch',
          priority: 'medium',
          title: `Monitoruj ${pos.symbol}`,
          description: `Cena zbliża się do stop-loss ${pos.stopLoss} PLN`,
          deadline: 'Ciągle'
        });
      }
      
      if (pos.weight > 22) {
        recommendations.push({
          type: 'action',
          priority: 'high',
          title: `Zmniejsz wagę ${pos.symbol}`,
          description: `Pozycja stanowi ${pos.weight}% portfela - przekracza strategiczny limit`,
          deadline: 'W ciągu tygodnia'
        });
      }
    });

    // Add learning recommendation
    recommendations.push({
      type: 'learn',
      priority: 'low',
      title: 'Lekcja CAN-SLIM: O - Outstanding Earnings',
      description: 'Zaplanowane na sobotę - analiza wyników PWR wraz z lekcją metodologii O\'Neil',
      deadline: 'Sobota 09:00'
    });

    const newReportData = {
      period: '13-19 Stycznia 2025',
      portfolioReturn: portfolioReturn,
      sp500Return: 1.8,
      alpha: portfolioReturn - 1.8,
      beta: 1.10,
      maxDrawdown: Math.max(-15, Math.min(...positions.map((p: any) => 
        ((p.currentPrice - p.buyPrice) / p.buyPrice) * 100
      ))),
      bestPerformer,
      worstPerformer,
      rebalanceNeeded: positions.some((p: any) => p.weight > 25),
      stopLossAlerts: positions.filter((p: any) => 
        p.stopLoss && p.currentPrice <= p.stopLoss
      ).length,
      recommendations
    };

    setReportData(newReportData);
    setIsLoading(false);

    toast({
      title: "Raport zsynchronizowany",
      description: "Dane tygodniowe zostały zaktualizowane"
    });
  };

  useEffect(() => {
    syncReportData();
  }, []);

  const upcomingScreenings = [
    {
      name: 'Finviz EPS Revision Up Q/Q',
      date: '17 Stycznia 17:00',
      duration: '20 min',
      description: 'Screening spółek z rosnącymi rewizjami EPS'
    },
    {
      name: 'Makro Dashboard Review',
      date: '17 Stycznia 17:20',
      duration: '15 min',
      description: 'Przegląd ISM, CPI i innych wskaźników makro'
    }
  ];

  const riskMetrics = [
    {
      metric: 'Portfolio Beta',
      current: reportData?.beta || 1.10,
      target: 0.90,
      status: 'above',
      description: 'Portfel bardziej zmienny od rynku'
    },
    {
      metric: 'Max pozycja',
      current: 22,
      target: 25,
      status: 'ok',
      description: 'Największa pozycja w limicie'
    },
    {
      metric: 'Sektor Tech',
      current: 35,
      target: 50,
      status: 'ok',
      description: 'Dywersyfikacja sektorowa w normie'
    }
  ];

  const exportToPDF = () => {
    if (!reportData) {
      toast({
        title: "Brak danych",
        description: "Najpierw zsynchronizuj raport",
        variant: "destructive"
      });
      return;
    }

    // For now, create a simple text report
    // In production, this would generate a proper PDF
    const reportContent = `
RAPORT TYGODNIOWY - ${reportData.period}

WYNIKI PORTFELA:
- Zwrot portfela: ${reportData.portfolioReturn.toFixed(2)}%
- S&P 500: ${reportData.sp500Return}%
- Alpha: ${reportData.alpha.toFixed(2)}%
- Beta: ${reportData.beta}
- Max Drawdown: ${reportData.maxDrawdown.toFixed(2)}%

NAJLEPSZE/NAJGORSZE POZYCJE:
- Najlepszy: ${reportData.bestPerformer.symbol} (+${reportData.bestPerformer.return.toFixed(2)}%)
- Najgorszy: ${reportData.worstPerformer.symbol} (${reportData.worstPerformer.return.toFixed(2)}%)

REKOMENDACJE:
${reportData.recommendations.map((rec: any, i: number) => 
  `${i + 1}. ${rec.title} - ${rec.description}`
).join('\n')}

ALERTY STOP-LOSS: ${reportData.stopLossAlerts}
REBALANSOWANIE: ${reportData.rebalanceNeeded ? 'Wymagane' : 'Nie wymagane'}
    `;

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raport-tygodniowy-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Raport wyeksportowany",
      description: "Plik został pobrany"
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      case 'above':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Button onClick={syncReportData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Ładowanie...' : 'Załaduj raport tygodniowy'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Raport Tygodniowy
          </CardTitle>
          <CardDescription>
            Okresowy przegląd wyników i rekomendacje na kolejny tydzień
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{reportData.period}</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={syncReportData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Synchronizuj
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="w-4 h-4 mr-2" />
                Eksportuj PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Wyniki</TabsTrigger>
          <TabsTrigger value="risk">Ryzyko</TabsTrigger>
          <TabsTrigger value="actions">Działania</TabsTrigger>
          <TabsTrigger value="schedule">Harmonogram</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Zwrot Portfela</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${reportData.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.portfolioReturn >= 0 ? '+' : ''}{reportData.portfolioReturn.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">w tym tygodniu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Alpha vs S&P 500</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${reportData.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.alpha >= 0 ? '+' : ''}{reportData.alpha.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  S&P 500: +{reportData.sp500Return}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reportData.maxDrawdown.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Cel: ≤ -15%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Najlepsze i Najgorsze Pozycje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">Najlepszy:</span>
                  </div>
                  <p className="font-bold text-green-800">
                    {reportData.bestPerformer.symbol}: +{reportData.bestPerformer.return.toFixed(1)}%
                  </p>
                </div>

                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="font-semibold">Najgorszy:</span>
                  </div>
                  <p className="font-bold text-red-800">
                    {reportData.worstPerformer.symbol}: {reportData.worstPerformer.return.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metryki Ryzyka</CardTitle>
              <CardDescription>
                Monitorowanie zgodności z zasadami strategii
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{metric.metric}</h4>
                      <p className="text-sm text-gray-600">{metric.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                        {metric.current}{metric.metric.includes('Beta') ? '' : '%'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cel: {metric.target}{metric.metric.includes('Beta') ? '' : '%'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rekomendowane Działania</CardTitle>
              <CardDescription>
                Konkretne kroki na podstawie analizy tygodniowej
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-xs text-gray-500">
                          Deadline: {rec.deadline}
                        </p>
                      </div>
                      {rec.type === 'action' && <Target className="w-5 h-5 text-blue-500 mt-1" />}
                      {rec.type === 'watch' && <AlertCircle className="w-5 h-5 text-amber-500 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nadchodzące Screening i Analizy</CardTitle>
              <CardDescription>
                Twój harmonogram na maksymalnie 3h tygodniowo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingScreenings.map((screening, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{screening.name}</h4>
                      <p className="text-sm text-gray-600">{screening.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{screening.date}</p>
                    </div>
                    <Badge variant="outline">{screening.duration}</Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Łączny czas w tym tygodniu: 2h 35min
                </h4>
                <Progress value={85} className="mb-2" />
                <p className="text-sm text-blue-700">
                  Pozostało: 25 min do limitu 3h/tydzień
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeeklyReport;
