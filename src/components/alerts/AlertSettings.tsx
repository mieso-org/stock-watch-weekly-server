
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AlertSettingsType {
  stopLoss: boolean;
  positionSize: boolean;
  weeklyReport: boolean;
  marketNews: boolean;
  portfolioRebalance: boolean;
}

interface AlertSettingsProps {
  alertSettings: AlertSettingsType;
  setAlertSettings: (settings: AlertSettingsType) => void;
}

const AlertSettings = ({ alertSettings, setAlertSettings }: AlertSettingsProps) => {
  const settingLabels = {
    stopLoss: 'Alerty Stop-Loss',
    positionSize: 'Przekroczenie 25% wagi pozycji',
    weeklyReport: 'Cotygodniowe raporty',
    marketNews: 'Newsy rynkowe',
    portfolioRebalance: 'Przypomnienia o rebalansowaniu'
  };

  return (
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
                {settingLabels[key as keyof AlertSettingsType]}
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
  );
};

export default AlertSettings;
