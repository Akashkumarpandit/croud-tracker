export interface Location {
  id: string;
  name: string;
  currentDensity: number;
  maxCapacity: number;
  historicalData: { time: string; density: number }[];
}
