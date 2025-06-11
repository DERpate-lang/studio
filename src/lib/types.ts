
import type { Timestamp } from "firebase/firestore";

export interface AnniversaryDate {
  date: string; // ISO string format YYYY-MM-DD
}

// For Firestore, date will be stored as Timestamp and converted
export interface Memory {
  id: string; // Firestore document ID
  date: string | Timestamp; // Stored as Timestamp in Firestore, string in component state initially
  title: string;
  description: string;
  photoUrl?: string; // Optional photo URL (can be data URI or web URL, not using Supabase Storage for this yet)
  "data-ai-hint"?: string; // Optional AI hint for the photo
  // userId?: string; // For future user-specific data
}

export interface LoveNote {
  id: string; // Firestore document ID
  date: string | Timestamp; // Stored as Timestamp in Firestore
  content: string;
  title?: string; // Optional title for the note
  // userId?: string;
}

export interface Milestone {
  id: string; // Firestore document ID
  date: string | Timestamp; // Stored as Timestamp in Firestore
  title: string;
  description: string;
  icon?: string; // Optional icon name
  // userId?: string;
}

// Photo type for Supabase integration
// 'id' and 'date_added' will be strings (UUID and ISO timestamp from Supabase)
// 'url' will now be a Supabase Storage public URL
export interface Photo {
  id: string; // UUID from Supabase DB
  url: string; // Public URL from Supabase Storage
  caption?: string;
  date_added: string; // ISO string from Supabase (timestamptz)
  data_ai_hint?: string;
  file_path?: string; // Store the path in Supabase Storage for deletion
}
