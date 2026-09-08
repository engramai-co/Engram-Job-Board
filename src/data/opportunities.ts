import type { DashboardData } from "../types";
import demoData from "./demo";

// Private data is opt-in for development/local builds and must remain gitignored.
// The Vite public-build guard replaces this local module before reading its contents.
const localModules = import.meta.glob<{ default: DashboardData }>("./opportunities.local.ts", { eager: true });
const localData = localModules["./opportunities.local.ts"]?.default;
export const isDemoData = import.meta.env.VITE_DEMO_ONLY === "true" || !localData;
export const jobTrackerData: DashboardData = isDemoData ? demoData : localData!;
