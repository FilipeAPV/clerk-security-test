"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
} from "recharts";

export default function CustomChart({ aaplDataWithBands }) {
  // Find the min/max values from the data to set Y-axis domain
  const minValue = Math.min(
    ...aaplDataWithBands.map((d) => Math.min(d.close, d.lowerBand))
  );
  const maxValue = Math.max(
    ...aaplDataWithBands.map((d) => Math.max(d.close, d.upperBand))
  );

  // Add padding to the Y-axis range to space out the lines
  const padding = 50;
  console.log([minValue - padding, maxValue + padding]); // You can adjust this value to suit your needs
  return (
    <div>
      <h1>Bollinger Bands for AAPL</h1>
      <ResponsiveContainer width="100%" height={800}>
        <LineChart data={aaplDataWithBands}>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString()}
          />
          <YAxis
            domain={[]} // Set domain with padding
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(2),
              name,
            ]}
            labelFormatter={(label) =>
              `Date: ${new Date(label).toLocaleDateString()}`
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="close"
            stroke="blue"
            dot={false}
            name="Closing Price"
          />
          <Line
            type="monotone"
            dataKey="upperBand"
            stroke="green"
            dot={false}
            name="Upper Band"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="lowerBand"
            stroke="red"
            dot={false}
            name="Lower Band"
            connectNulls={false}
          />
          {/* Optional: Add a Brush for zooming and panning */}
          <Brush dataKey="date" height={30} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
