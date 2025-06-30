
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

interface AlertsSyncProps {
  onSync: () => void;
  isLoading: boolean;
}

const AlertsSync = ({ onSync, isLoading }: AlertsSyncProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button 
          onClick={onSync} 
          disabled={isLoading}
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Synchronizowanie...' : 'Synchronizuj alerty z portfelem'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AlertsSync;
