export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  restrictions?: string[];
  building: string;
  floor: number;
  status: 'available' | 'booked' | 'maintenance';
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  user: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  type?: 'chat' | 'recommendation' | 'booking_status';
  recommendation?: AIRecommendation;
  isStreaming?: boolean;
}

export interface AIResponse {
  content: string;
  type?: 'chat' | 'recommendation' | 'booking_status';
  recommendation?: AIRecommendation;
}