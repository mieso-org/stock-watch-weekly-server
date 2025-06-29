
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bell, Mail, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const AlertsPanel = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAlerts, setCurrentAlerts] = useState<any[]>([]);
  const [alertSettings, setAlertSettings] = useState({
    stopLoss: true,
    positionSize: true,
    weeklyReport: true,
    marketNews: false,
    portfolioRebalance: true
  });

  const upcomingActions = [
    {
      action: 'Screening Finviz "EPS rev up Q/Q"',
      scheduledFor: 'Piątek 17:00',
      duration: '20 min'
    },
    {
      action: 'Analiza makro-dashboard (ISM, CPI)',
      scheduledFor: 'Piątek 17:20',
      duration: '15 min'
    },
    {
      action: 'Analiza 10-Q PWR + lekcja CAN-SLIM',
      scheduledFor: 'Sobota 09:00',
      duration: '90 min'
    }
  ];

  useEffect(() => {
    syncAlerts();
  }, []);

  const syncAlerts = () => {
    setIsLoading(true);
    
    // Get current positions from localStorage
    const positions = JSON.parse(localStorage.getItem('stockPositions') || '[]');
    const newAlerts = [];

    positions.forEach((position: any) => {
      // Check stop-loss alerts
      if (position.stopLoss && position.currentPrice <= position.stopLoss) {
        newAlerts.push({
          id: `sl-${position.id}`,
          type: 'warning',
          message: `${position.symbol} osiągnęła stop-loss poziom (${position.stopLoss} PLN)`,
          timestamp: new Date().toLocaleString('pl-PL'),
          priority: 'high'
        });
      }

      // Check position size alerts
      if (position.weight > 25) {
        newAlerts.push({
          id: `ps-${position.id}`,
          type: 'warning',
          message: `${position.symbol} przekracza 25% wagi portfela (${position.weight}%)`,
          timestamp: new Date().toLocaleString('pl-PL'),
          priority: 'high'
        });
      }

      // Check for significant gains (trailing stop recommendation)
      const gain = ((position.currentPrice - position.buyPrice) / position.buyPrice) * 100;
      if (gain > 10) {
        newAlerts.push({
          id: `ts-${position.id}`,
          type: 'success',
          message: `${position.symbol} wzrosła o ${gain.toFixed(1)}% - rozważ trailing stop`,
          timestamp: new Date().toLocaleString('pl-PL'),
          priority: 'medium'
        });
      }
    });

    // Add general weekly report alert
    newAlerts.push({
      id: 'weekly-report',
      type: 'info',
      message: 'Cotygodniowy przegląd portfela dostępny',
      timestamp: new Date().toLocaleString('pl-PL'),
      priority: 'low'
    });

    setCurrentAlerts(newAlerts);
    setIsLoading(false);

    toast({
      title: "Alerty zsynchronizowane",
      description: `Znaleziono ${newAlerts.length} aktywnych alertów`
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // For now, just show success message
      // In production, this would integrate with Supabase Edge Functions
      toast({
        title: "Email zapisany",
        description: `Powiadomienia będą wysyłane na ${email}`,
      });
      
      // TODO: Integrate with Supabase for actual email sending
      console.log('Email configuration saved:', email);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={syncAlerts} 
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Synchronizowanie...' : 'Synchronizuj alerty z portfelem'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Aktywne Alerty ({currentAlerts.length})
          </CardTitle>
          <CardDescription>
            Bieżące powiadomienia dotyczące Twojego portfela
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Brak aktywnych alertów. Kliknij "Synchronizuj" aby sprawdzić aktualne alerty.
              </p>
            ) : (
              currentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                  </div>
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Zaplanowane Działania</CardTitle>
          <CardDescription>
            Twój harmonogram analizy zgodnie ze strategią 3h/tydzień
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{action.action}</p>
                  <p className="text-sm text-gray-600">{action.scheduledFor}</p>
                </div>
                <Badge variant="outline">{action.duration}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Powiadomienia Email
          </CardTitle>
          <CardDescription>
            Skonfiguruj automatyczne raporty tygodniowe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
            <Label htmlFor="email-notifications">
              Włącz powiadomienia email
            </Label>
          </div>

          {emailNotifications && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <Label htmlFor="email">Adres email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Funkcja wysyłania emaili wymaga konfiguracji Supabase
                </p>
              </div>
              <Button type="submit" size="sm">
                Zapisz email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia Alertów</CardTitle>
          <CardDescription>
            Dostosuj rodzaje powiadomień które chcesz otrzymywać
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(alertSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="cursor-pointer">
                  {key === 'stopLoss' && 'Alerty Stop-Loss'}
                  {key === 'positionSize' && 'Przekroczenie 25% wagi pozycji'}
                  {key === 'weeklyReport' && 'Cotygodniowe raporty'}
                  {key === 'marketNews' && 'Newsy rynkowe'}
                  {key === 'portfolioRebalance' && 'Przypomnienia o rebalansowaniu'}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPanel;
