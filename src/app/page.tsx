import { Button } from "@/components/ui/button";
import {
  aggregateToWeeklyData,
  calculateBollingerBands,
  calculateWeeklyBollingerBands,
  formatDate,
} from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

import { aapl } from "@/data/data";
import CustomChart from "@/components/chart/custom-line";
import BollingerBandsChart from "@/components/chart/test2";
import React from "react";
import { Editor } from "@/components/editor";
import EditorComponent from "@/components/my_editor";

interface StockData {
  date: string;
  close: number;
}
export default async function Home() {
  const user = await currentUser();
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  const apiKey = process.env.FMP_KEY;
  const symbols = ["AAPL", "TSLA"];
  const fromDate = formatDate(oneYearAgo);
  const toDate = formatDate(today);

  const fetchStockData = async (symbol: string): Promise<StockData[]> => {
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fromDate}&to=${toDate}&serietype=line&apikey=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();
    return data.historical.map((item: any) => ({
      date: item.date,
      close: item.close,
    }));
  };

  const [aaplData1] = await Promise.all(symbols.map(fetchStockData));
  const aaplData = aaplData1.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const aaplDataWithBands = calculateBollingerBands(aaplData);
  // Aggregate to weekly data
  const weeklyData = aggregateToWeeklyData(aaplData);

  // Calculate Bollinger Bands on weekly data
  const weeklyDataWithBands = calculateWeeklyBollingerBands(weeklyData);

  return (
    <>
      {/*   <BollingerBandsChart daily={aaplData} weekly={weeklyData} />
      <CustomChart aaplDataWithBands={aaplDataWithBands} />
      <CustomChart aaplDataWithBands={weeklyDataWithBands} /> */}
      <EditorComponent />
    </>
  );
}
