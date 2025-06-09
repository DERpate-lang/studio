export interface AnniversaryDate {
  date: string; // ISO string format YYYY-MM-DD
}

export interface Memory {
  id: string;
  date: string; // ISO string format YYYY-MM-DD
  title: string;
  description: string;
  photoUrl?: string; // Optional photo URL
}

export interface LoveNote {
  id: string;
  date: string; // ISO string for creation/last updated
  content: string;
  title?: string; // Optional title for the note
}

export interface Milestone {
  id: string;
  date: string; // ISO string format YYYY-MM-DD
  title: string;
  description: string;
  icon?: string; // Optional icon name (e.g., from lucide-react)
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  dateAdded: string; // ISO string
}
