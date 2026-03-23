export type ItemType = 'flight' | 'hotel' | 'activity' | 'transport';

export interface TripItem {
  id: string;
  type: ItemType;
  title: string;
  date: string;
  details: string;
  creator: string;
  timestamp: number;
  status?: 'confirmed' | 'proposed';
}

export interface Trip {
  id: string;
  name: string;
  members: string[];
  items: TripItem[];
  proposals: TripItem[];
}

export interface User {
  id: string;
  name: string;
  color: string;
}
