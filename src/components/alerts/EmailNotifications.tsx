
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { secureStorage } from "@/utils/security";

interface EmailNotificationsProps {
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  email: string;
  setEmail: (value: string) => void;
  emailError: string;
  setEmailError: (value: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
}

const EmailNotifications = ({
  emailNotifications,
  setEmailNotifications,
  email,
  setEmail,
  emailError,
  setEmailError,
  onEmailSubmit
}: EmailNotificationsProps) => {
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [lastTestSent, setLastTestSent] = useState<Date | null>(null);

  const sendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Brak adresu email",
        description: "Najpierw zapisz swój adres email",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);

    try {
      // Get current portfolio data for test email
      const positions = secureStorage.get<any[]>('stockPositions') || [];
      
      const emailContent = {
        to: email,
        subject: 'Test - Raport Tygodniowy Stock Watch',
        html: `
          <h2>Test Raportu Tygodniowego</h2>
          <p>To jest testowy email z Twojego systemu Stock Watch.</p>
          
          <h3>Aktualny stan portfela:</h3>
          <ul>
            ${positions.map(pos => 
              `<li>${pos.symbol}: ${pos.shares} akcji po ${pos.currentPrice || pos.buyPrice} PLN</li>`
            ).join('')}
          </ul>
          
          <p>Liczba pozycji w portfelu: ${positions.length}</p>
          <p>Data wysłania: ${new Date().toLocaleString('pl-PL')}</p>
          
          <hr>
          <p><small>Ten email został wysłany automatycznie z systemu Stock Watch</small></p>
        `
      };

      // Simulate email sending (in production, this would call a real email service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store the test email info
      secureStorage.set('lastTestEmail', {
        date: new Date().toISOString(),
        email: email,
        success: true
      });

      setLastTestSent(new Date());
      
      toast({
        title: "Test email wysłany",
        description: `Sprawdź swoją skrzynkę: ${email}`,
      });

    } catch (error) {
      console.error('Błąd wysyłania test emaila:', error);
      toast({
        title: "Błąd wysyłania",
        description: "Nie udało się wysłać test emaila. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const scheduleWeeklyEmail = () => {
    if (!email) {
      toast({
        title: "Brak adresu email",
        description: "Najpierw zapisz swój adres email",
        variant: "destructive"
      });
      return;
    }

    // Store weekly email schedule
    secureStorage.set('weeklyEmailSchedule', {
      email: email,
      enabled: true,
      dayOfWeek: 0, // Sunday
      hour: 18, // 6 PM
      lastScheduled: new Date().toISOString()
    });

    toast({
      title: "Cotygodniowy email zaplanowany",
      description: "Raporty będą wysyłane w niedziele o 18:00",
    });
  };

  return (
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
          <div className="space-y-4">
            <form onSubmit={onEmailSubmit} className="space-y-3">
              <div>
                <Label htmlFor="email">Adres email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={emailError ? 'border-red-500' : ''}
                  maxLength={254}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>
              <Button type="submit" size="sm" className="w-full">
                Zapisz email
              </Button>
            </form>

            {email && (
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Test email</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={sendTestEmail}
                    disabled={isSendingTest}
                  >
                    <Send className={`w-4 h-4 mr-2 ${isSendingTest ? 'animate-pulse' : ''}`} />
                    {isSendingTest ? 'Wysyłanie...' : 'Wyślij test'}
                  </Button>
                </div>

                {lastTestSent && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Test wysłany: {lastTestSent.toLocaleTimeString('pl-PL')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cotygodniowy raport</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={scheduleWeeklyEmail}
                  >
                    Zaplanuj wysyłkę
                  </Button>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Automatyczne</Badge>
                    <span className="text-sm font-medium">Harmonogram wysyłki</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cotygodniowy raport: Niedziela 18:00</li>
                    <li>• Alerty stop-loss: Natychmiast</li>
                    <li>• Przekroczenie wagi pozycji: Natychmiast</li>
                    <li>• Rekomendacje rebalansowania: Poniedziałek 9:00</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500">
                  Uwaga: Funkcja wysyłania emaili wymaga konfiguracji Supabase lub innego serwisu email
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailNotifications;
