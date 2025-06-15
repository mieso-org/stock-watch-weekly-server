
import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortfolioOverview from '@/components/PortfolioOverview';
import StockForm from '@/components/StockForm';
import AlertsPanel from '@/components/AlertsPanel';
import WeeklyReport from '@/components/WeeklyReport';
import { TrendingUp, Bell, PlusCircle, BarChart3 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stock Watch - Raport Tygodniowy
          </h1>
          <p className="text-gray-600">
            Zarządzanie portfelem według strategii "Barbell Growth + 3-mies. cash"
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfel
            </TabsTrigger>
            <TabsTrigger value="add-stock" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Dodaj Akcje
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerty
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Raporty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PortfolioOverview />
          </TabsContent>

          <TabsContent value="add-stock">
            <StockForm />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>

          <TabsContent value="reports">
            <WeeklyReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
