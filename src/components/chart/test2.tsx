"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function calculateSMA(data, period) {
  return data.map((_, index, array) => {
    if (index < period - 1) return null;
    const sum = array
      .slice(index - period + 1, index + 1)
      .reduce((acc, val) => acc + val.close, 0);
    return sum / period;
  });
}

function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const sma = calculateSMA(data, period);
  return data.map((_, index, array) => {
    if (index < period - 1) return { upper: null, lower: null, sma: null };
    const slice = array.slice(index - period + 1, index + 1);
    const avg = sma[index];
    const stdDev = Math.sqrt(
      slice.reduce((sum, item) => sum + Math.pow(item.close - avg, 2), 0) /
        period
    );
    const upper = avg + multiplier * stdDev;
    const lower = avg - multiplier * stdDev;
    const isContracting =
      index > period &&
      upper - lower < array[index - 1].upper - array[index - 1].lower;
    return {
      upper,
      lower,
      sma: avg,
      isContracting,
    };
  });
}

export default function BollingerBandsChart({ daily, weekly }) {
  const [period, setPeriod] = useState(20);
  const [multiplier, setMultiplier] = useState(2);
  const [horizontalLines, setHorizontalLines] = useState([]);
  const [lineValue, setLineValue] = useState("");

  const dailyChartData = useMemo(() => {
    const bands = calculateBollingerBands(daily, period, multiplier);
    return daily.map((item, index) => ({
      ...item,
      upper: bands[index].upper,
      lower: bands[index].lower,
      sma: bands[index].sma,
      isContracting: bands[index].isContracting,
    }));
  }, [period, multiplier]);

  const weeklyChartData = useMemo(() => {
    const bands = calculateBollingerBands(weekly, period, multiplier);
    return weekly.map((item, index) => ({
      ...item,
      upper: bands[index].upper,
      lower: bands[index].lower,
      sma: bands[index].sma,
      isContracting: bands[index].isContracting,
    }));
  }, [period, multiplier]);

  const addHorizontalLine = () => {
    if (lineValue) {
      setHorizontalLines((prev) => [
        ...prev,
        { value: parseFloat(lineValue), id: Date.now() },
      ]);
      setLineValue("");
    }
  };

  const removeHorizontalLine = (id) => {
    setHorizontalLines((prev) => prev.filter((line) => line.id !== id));
  };

  const renderChart = (showBollingerBands = true, chartData) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
          interval={Math.floor(chartData.length / 10)}
        />
        <YAxis domain={["auto", "auto"]} />
        <Line
          type="monotone"
          dataKey="close"
          stroke="hsl(var(--primary))"
          dot={false}
        />
        {showBollingerBands && (
          <>
            <Line
              type="monotone"
              dataKey="upper"
              stroke="hsl(var(--secondary))"
              dot={false}
              strokeDasharray="5 5"
              strokeOpacity={(entry) => (entry.isContracting ? 0 : 1)}
            />
            <Line
              type="monotone"
              dataKey="upper"
              stroke="hsl(var(--destructive))"
              dot={false}
              strokeDasharray="5 5"
              strokeOpacity={(entry) => (entry.isContracting ? 1 : 0)}
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="hsl(var(--secondary))"
              dot={false}
              strokeDasharray="5 5"
              strokeOpacity={(entry) => (entry.isContracting ? 0 : 1)}
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="hsl(var(--destructive))"
              dot={false}
              strokeDasharray="5 5"
              strokeOpacity={(entry) => (entry.isContracting ? 1 : 0)}
            />
            <Line
              type="monotone"
              dataKey="sma"
              stroke="hsl(var(--accent))"
              dot={false}
            />
          </>
        )}
        {horizontalLines.map((line) => (
          <ReferenceLine
            key={line.id}
            y={line.value}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            label={{ value: line.value.toFixed(2), position: "right" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AAPL Stock - Bollinger Bands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <div>
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              type="number"
              value={period}
              onChange={(e) =>
                setPeriod(Math.max(2, Math.min(100, Number(e.target.value))))
              }
              min="2"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="multiplier">Multiplier</Label>
            <Input
              id="multiplier"
              type="number"
              value={multiplier}
              onChange={(e) =>
                setMultiplier(
                  Math.max(0.1, Math.min(5, Number(e.target.value)))
                )
              }
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="horizontalLine">Horizontal Line</Label>
            <div className="flex">
              <Input
                id="horizontalLine"
                type="number"
                value={lineValue}
                onChange={(e) => setLineValue(e.target.value)}
                placeholder="Enter value"
              />
              <Button onClick={addHorizontalLine} className="ml-2">
                Add Line
              </Button>
            </div>
          </div>
        </div>
        <div className="mb-4">
          {horizontalLines.map((line) => (
            <div key={line.id} className="flex items-center mb-2">
              <span>Line at {line.value.toFixed(2)}</span>
              <Button
                onClick={() => removeHorizontalLine(line.id)}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex h-[600px]">
          <div className="w-1/2 pr-2">{renderChart(true, weeklyChartData)}</div>
          <div className="w-1/2 pl-2">{renderChart(true, dailyChartData)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
