
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Action {
  action: string;
  scheduledFor: string;
  duration: string;
}

interface UpcomingActionsProps {
  actions: Action[];
}

const UpcomingActions = ({ actions }: UpcomingActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zaplanowane Działania</CardTitle>
        <CardDescription>
          Twój harmonogram analizy zgodnie ze strategią 3h/tydzień
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
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
  );
};

export default UpcomingActions;
