import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseISO, getISOWeek, getISOWeekYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateBollingerBands = (
  data: { date: string; close: number }[],
  windowSize = 20
) => {
  const closingPrices = data.map((item) => item.close);

  const ema: number[] = [];
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  const k = 2 / (windowSize + 1); // Smoothing factor for EMA

  // Initialize EMA with the first closing price
  ema[0] = closingPrices[0];
  upperBand[0] = NaN;
  lowerBand[0] = NaN;

  for (let i = 1; i < closingPrices.length; i++) {
    // Calculate EMA
    ema[i] = closingPrices[i] * k + ema[i - 1] * (1 - k);

    if (i >= windowSize - 1) {
      // Calculate Standard Deviation over the window
      const windowSlice = closingPrices.slice(i - windowSize + 1, i + 1);
      const mean = ema[i];
      const variance =
        windowSlice.reduce((acc, val) => acc + (val - mean) ** 2, 0) /
        windowSize;
      const stdDev = Math.sqrt(variance);

      upperBand[i] = mean + 2 * stdDev;
      lowerBand[i] = mean - 2 * stdDev;
    } else {
      upperBand[i] = NaN;
      lowerBand[i] = NaN;
    }
  }

  // Combine all data into a single array of objects
  const result = data.map((item, index) => ({
    date: item.date,
    close: item.close,
    upperBand: upperBand[index],
    lowerBand: lowerBand[index],
  }));

  return result;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

interface WeeklyData {
  date: string; // We'll use the date of the last trading day in the week
  close: number;
}

export const aggregateToWeeklyData = (
  data: { date: string; close: number }[]
): WeeklyData[] => {
  const weeklyDataMap = new Map<string, WeeklyData>();

  data.forEach((item) => {
    const date = parseISO(item.date);
    const weekNumber = getISOWeek(date);
    const year = getISOWeekYear(date);
    const weekKey = `${year}-W${weekNumber}`;

    // Since data is sorted by date ascending, the last entry for the week will be the last trading day
    weeklyDataMap.set(weekKey, {
      date: item.date,
      close: item.close,
    });
  });

  // Convert the map values to an array and sort by date
  const weeklyData = Array.from(weeklyDataMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return weeklyData;
};

export const calculateWeeklyBollingerBands = (
  data: WeeklyData[],
  windowSize = 20
) => {
  const closingPrices = data.map((item) => item.close);
  const dates = data.map((item) => item.date);

  const ema: number[] = [];
  const upperBand: (number | null)[] = [];
  const lowerBand: (number | null)[] = [];

  const k = 2 / (windowSize + 1); // Smoothing factor for EMA

  // Initialize EMA with the first closing price
  ema[0] = closingPrices[0];
  upperBand[0] = null;
  lowerBand[0] = null;

  for (let i = 1; i < closingPrices.length; i++) {
    // Calculate EMA
    ema[i] = closingPrices[i] * k + ema[i - 1] * (1 - k);

    if (i >= windowSize - 1) {
      // Calculate Standard Deviation over the window
      const windowSlice = closingPrices.slice(i - windowSize + 1, i + 1);
      const mean = ema[i];
      const variance =
        windowSlice.reduce((acc, val) => acc + (val - mean) ** 2, 0) /
        windowSize;
      const stdDev = Math.sqrt(variance);

      upperBand[i] = mean + 2 * stdDev;
      lowerBand[i] = mean - 2 * stdDev;
    } else {
      upperBand[i] = null;
      lowerBand[i] = null;
    }
  }

  // Combine all data into a single array of objects
  const result = data.map((item, index) => ({
    date: item.date,
    close: item.close,
    upperBand: upperBand[index],
    lowerBand: lowerBand[index],
  }));

  return result;
};
