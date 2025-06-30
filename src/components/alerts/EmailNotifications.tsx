
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail } from 'lucide-react';

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
  );
};

export default EmailNotifications;
