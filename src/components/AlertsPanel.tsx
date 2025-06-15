
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bell, Mail, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const AlertsPanel = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [email, setEmail] = useState('');
  const [alertSettings, setAlertSettings] = useState({
    stopLoss: true,
    positionSize: true,
    weeklyReport: true,
    marketNews: false,
    portfolioRebalance: true
  });

  const currentAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'NVDA osiągnęła 88% stop-loss poziomu (466 PLN)',
      timestamp: '2025-01-15 09:30',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      message: 'Cotygodniowy przegląd portfela dostępny',
      timestamp: '2025-01-15 08:00',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      message: 'MSFT wzrosła o 2.2% - rozważ trailing stop',
      timestamp: '2025-01-14 16:45',
      priority: 'low'
    }
  ];

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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Powiadomienia email skonfigurowane",
        description: `Raporty będą wysyłane na ${email}`
      });
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
      {/* Current Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Aktywne Alerty
          </CardTitle>
          <CardDescription>
            Bieżące powiadomienia dotyczące Twojego portfela
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentAlerts.map((alert) => (
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
            ))}
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
