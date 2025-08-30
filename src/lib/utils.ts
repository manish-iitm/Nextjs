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
  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
  }
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error(results.errors.map(e => e.message).join(', ')));
        } else {
          const notifications = results.data.map((row: any) => ({
            heading: row.heading,
            message: row.message
          })).filter(n => n.heading && n.message);
          resolve(notifications as Notification[]);
        }
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}
