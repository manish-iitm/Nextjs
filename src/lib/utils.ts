import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";
import { Notification } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchAndParseNotifications(): Promise<Notification[]> {
  const response = await fetch(
    "https://docs.google.com/spreadsheets/d/1k0II1UkKG88xyoNgvRPoHBQg1snKHE94jNrs7vUxfv8/export?format=csv"
  );
  const csvText = await response.text();
  const parsedData = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return parsedData.data as Notification[];
}
