
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
    if (!formData.symbol || !formData.shares || !formData.buyPrice) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie wymagane pola",
        variant: "destructive"
      });
      return;
    }

    const shares = parseFloat(formData.shares);
    const buyPrice = parseFloat(formData.buyPrice);
    const totalValue = shares * buyPrice;
    
    // Check if position would exceed 25% rule
    const portfolioValue = 7301; // Current portfolio value
    const positionWeight = (totalValue / (portfolioValue + totalValue)) * 100;
    
    if (positionWeight > 25) {
      toast({
        title: "Ostrzeżenie",
        description: `Ta pozycja będzie stanowić ${positionWeight.toFixed(1)}% portfela, co przekracza limit 25%`,
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage (in real app this would go to a database)
    const existingPositions = JSON.parse(localStorage.getItem('stockPositions') || '[]');
    const newPosition = {
      id: Date.now().toString(),
      ...formData,
      shares: parseFloat(formData.shares),
      buyPrice: parseFloat(formData.buyPrice),
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
      dateAdded: new Date().toISOString(),
      weight: positionWeight
    };
    
    existingPositions.push(newPosition);
    localStorage.setItem('stockPositions', JSON.stringify(existingPositions));

    toast({
      title: "Sukces",
      description: `Dodano pozycję ${formData.symbol} (${positionWeight.toFixed(1)}% portfela)`
    });

    // Reset form
    setFormData({
      symbol: '',
      name: '',
      shares: '',
      buyPrice: '',
      sector: '',
      stopLoss: ''
    });
  };

  const calculatePositionSize = () => {
    if (formData.shares && formData.buyPrice) {
      const totalValue = parseFloat(formData.shares) * parseFloat(formData.buyPrice);
      const portfolioValue = 7301;
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shares">Liczba Akcji *</Label>
                <Input
                  id="shares"
                  type="number"
                  step="0.1"
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
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="etf">ETF</SelectItem>
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
