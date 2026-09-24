// Типове данни — отговарят на таблиците в supabase/migrations/0001_init.sql

export type AlertCategory =
  | "emergency"
  | "utilities"
  | "road"
  | "events"
  | "memorial"
  | "ads";

export type UserRole = "admin" | "verified" | "resident";

export type Author = {
  full_name: string | null;
  organization: string | null;
  role: UserRole;
};

export type Alert = {
  id: string;
  category: AlertCategory;
  title: string;
  body: string | null;
  is_important: boolean;
  expected_until: string | null;
  resolved_at: string | null;
  created_at: string;
  author: Author | null;
};

export type VillageEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  category: AlertCategory;
};

export type Post = {
  id: string;
  kind: "news" | "ad";
  title: string;
  body: string;
  image_url: string | null;
  published_at: string;
  author: Author | null;
};
