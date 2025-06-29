
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const StockForm = () => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    shares: '',
    buyPrice: '',
    currentPrice: '',
    sector: '',
    stopLoss: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.symbol || !formData.shares || !formData.buyPrice || !formData.currentPrice) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie wymagane pola",
        variant: "destructive"
      });
      return;
    }

    const shares = parseFloat(formData.shares);
    const buyPrice = parseFloat(formData.buyPrice);
    const currentPrice = parseFloat(formData.currentPrice);
    const totalValue = shares * currentPrice;
    
    // Get current portfolio value
    const existingPositions = JSON.parse(localStorage.getItem('stockPositions') || '[]');
    const portfolioValue = existingPositions.reduce((sum: number, pos: any) => 
      sum + (pos.currentPrice * pos.shares), 0);
    
    const positionWeight = (totalValue / (portfolioValue + totalValue)) * 100;
    
    if (positionWeight > 25) {
      toast({
        title: "Ostrzeżenie",
        description: `Ta pozycja będzie stanowić ${positionWeight.toFixed(1)}% portfela, co przekracza limit 25%`,
        variant: "destructive"
      });
      return;
    }

    const newPosition = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol.toUpperCase(),
      shares: shares,
      buyPrice: buyPrice,
      currentPrice: currentPrice,
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
      sector: formData.sector || 'Other',
      weight: Math.round(positionWeight * 10) / 10,
      dateAdded: new Date().toISOString()
    };
    
    existingPositions.push(newPosition);
    localStorage.setItem('stockPositions', JSON.stringify(existingPositions));

    toast({
      title: "Sukces",
      description: `Dodano pozycję ${formData.symbol.toUpperCase()} (${positionWeight.toFixed(1)}% portfela)`
    });

    // Reset form
    setFormData({
      symbol: '',
      name: '',
      shares: '',
      buyPrice: '',
      currentPrice: '',
      sector: '',
      stopLoss: ''
    });
  };

  const calculatePositionSize = () => {
    if (formData.shares && formData.currentPrice) {
      const totalValue = parseFloat(formData.shares) * parseFloat(formData.currentPrice);
      const existingPositions = JSON.parse(localStorage.getItem('stockPositions') || '[]');
      const portfolioValue = existingPositions.reduce((sum: number, pos: any) => 
        sum + (pos.currentPrice * pos.shares), 0);
      const weight = (totalValue / (portfolioValue + totalValue)) * 100;
      return { totalValue, weight };
    }
    return null;
  };

  const positionCalc = calculatePositionSize();

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Dodaj Nową Pozycję</CardTitle>
          <CardDescription>
            Dodaj nową akcję do swojego portfela zgodnie ze strategią Barbell Growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol Akcji *</Label>
                <Input
                  id="symbol"
                  placeholder="np. MSFT"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nazwa Spółki</Label>
                <Input
                  id="name"
                  placeholder="Microsoft Corporation"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shares">Liczba Akcji *</Label>
                <Input
                  id="shares"
                  type="number"
                  step="0.0001"
                  placeholder="10"
                  value={formData.shares}
                  onChange={(e) => handleInputChange('shares', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyPrice">Cena Zakupu (PLN) *</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="0.01"
                  placeholder="1737.50"
                  value={formData.buyPrice}
                  onChange={(e) => handleInputChange('buyPrice', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPrice">Cena Bieżąca (PLN) *</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  placeholder="1750.00"
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Sektor</Label>
                <Select onValueChange={(value) => handleInputChange('sector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz sektor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="biotechnology">Biotechnology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="etf">ETF</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (PLN)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.01"
                  placeholder="1529.00"
                  value={formData.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                />
              </div>
            </div>

            {positionCalc && (
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-blue-900 mb-2">Podsumowanie Pozycji:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Wartość pozycji:</span>
                    <div className="font-semibold">{positionCalc.totalValue.toLocaleString()} PLN</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Waga w portfelu:</span>
                    <div className={`font-semibold ${positionCalc.weight > 25 ? 'text-red-600' : 'text-green-600'}`}>
                      {positionCalc.weight.toFixed(1)}%
                    </div>
                  </div>
                </div>
                {positionCalc.weight > 25 && (
                  <div className="mt-2 text-red-600 text-sm">
                    ⚠️ Pozycja przekracza limit 25% portfela
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full">
              Dodaj Pozycję
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockForm;
