export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  restrictions?: string[];
  building: string;
  floor: number;
}

export interface Zone {
  id: string;
  name: string;
  classrooms: Classroom[];
  equipment: string[];
  totalCapacity: number;
  restrictions?: string[];
  color: string;
  position: { x: number; y: number; width: number; height: number };
}

export interface AIRecommendation {
  zoneId: string;
  reason: string;
  score: number;
  suggestedClassrooms: string[];
}