
import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { secureStorage, validateInput } from "@/utils/security";
import AlertsSync from './alerts/AlertsSync';
import CurrentAlerts from './alerts/CurrentAlerts';
import UpcomingActions from './alerts/UpcomingActions';
import EmailNotifications from './alerts/EmailNotifications';
import AlertSettings from './alerts/AlertSettings';

const AlertsPanel = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
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
    
    // Get current positions from secure storage
    const positions = secureStorage.get<any[]>('stockPositions') || [];
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
    
    if (!email) {
      setEmailError('Email jest wymagany');
      return;
    }
    
    if (!validateInput.email(email)) {
      setEmailError('Nieprawidłowy format email');
      return;
    }

    setEmailError('');
    
    // Store email securely
    secureStorage.set('notificationEmail', email);
    
    toast({
      title: "Email zapisany",
      description: `Powiadomienia będą wysyłane na ${email}`,
    });
  };

  return (
    <div className="space-y-6">
      <AlertsSync onSync={syncAlerts} isLoading={isLoading} />
      <CurrentAlerts alerts={currentAlerts} />
      <UpcomingActions actions={upcomingActions} />
      <EmailNotifications
        emailNotifications={emailNotifications}
        setEmailNotifications={setEmailNotifications}
        email={email}
        setEmail={setEmail}
        emailError={emailError}
        setEmailError={setEmailError}
        onEmailSubmit={handleEmailSubmit}
      />
      <AlertSettings
        alertSettings={alertSettings}
        setAlertSettings={setAlertSettings}
      />
    </div>
  );
};

export default AlertsPanel;
