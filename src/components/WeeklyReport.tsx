
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, Target, Calendar, Download } from 'lucide-react';

const WeeklyReport = () => {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const weeklyData = {
    current: {
      period: '13-19 Stycznia 2025',
      portfolioReturn: 2.1,
      sp500Return: 1.8,
      alpha: 0.3,
      beta: 1.10,
      maxDrawdown: -3.2,
      bestPerformer: { symbol: 'MSFT', return: 4.2 },
      worstPerformer: { symbol: 'NVDA', return: -1.5 },
      rebalanceNeeded: false,
      stopLossAlerts: 1
    }
  };

  const currentData = weeklyData.current;

  const recommendations = [
    {
      type: 'action',
      priority: 'high',
      title: 'Ustaw trailing stop na MSFT',
      description: 'Akcja wzrosła o 4.2% - rozważ trailing stop na poziomie 12% poniżej maksimum',
      deadline: '20 Stycznia'
    },
    {
      type: 'watch',
      priority: 'medium',
      title: 'Monitoruj NVDA',
      description: 'Spadek -1.5% w tygodniu, obserwuj czy nie zbliża się do stop-loss 466 PLN',
      deadline: 'Ciągle'
    },
    {
      type: 'learn',
      priority: 'low',
      title: 'Lekcja CAN-SLIM: O - Outstanding Earnings',
      description: 'Zaplanowane na sobotę - analiza wyników PWR wraz z lekcją metodologii O\'Neil',
      deadline: '18 Stycznia 09:00'
    }
  ];

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
      current: 1.10,
      target: 0.90,
      status: 'above',
      description: 'Portfel bardziej zmienny od rynku'
    },
    {
      metric: 'Max pozycja',
      current: 22,
      target: 25,
      status: 'ok',
      description: 'PWR - największa pozycja w limicie'
    },
    {
      metric: 'Sektor Tech',
      current: 35,
      target: 50,
      status: 'ok',
      description: 'Dywersyfikacja sektorowa w normie'
    }
  ];

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
            <h3 className="text-lg font-semibold">{currentData.period}</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Eksportuj PDF
            </Button>
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
                <div className="text-2xl font-bold text-green-600">
                  +{currentData.portfolioReturn}%
                </div>
                <p className="text-sm text-gray-600">w tym tygodniu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Alpha vs S&P 500</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{currentData.alpha}%
                </div>
                <p className="text-sm text-gray-600">
                  S&P 500: +{currentData.sp500Return}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {currentData.maxDrawdown}%
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
                    {currentData.bestPerformer.symbol}: +{currentData.bestPerformer.return}%
                  </p>
                </div>

                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="font-semibold">Najgorszy:</span>
                  </div>
                  <p className="font-bold text-red-800">
                    {currentData.worstPerformer.symbol}: {currentData.worstPerformer.return}%
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
                {recommendations.map((rec, index) => (
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
