// Типове данни — отговарят на таблиците в supabase/migrations/

export type AlertCategory = "emergency" | "utilities" | "road" | "events" | "memorial" | "ads";

export type UserRole = "admin" | "verified" | "resident";

export type ModerationStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  full_name: string | null;
  organization: string | null;
  role: UserRole;
  avatar_url: string | null;
};

// Авторът, както се показва до публикация
export type Author = Profile;

export type Alert = {
  id: string;
  category: AlertCategory;
  title: string;
  body: string | null;
  is_important: boolean;
  expected_until: string | null;
  resolved_at: string | null;
  created_at: string;
  author_id: string | null;
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
  image_url: string | null;
  status: ModerationStatus;
  created_at: string;
  author_id: string | null;
  author: Author | null;
};

export type Post = {
  id: string;
  kind: "news" | "ad";
  title: string;
  body: string;
  image_url: string | null;
  status: ModerationStatus;
  published_at: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  author_id: string | null;
  author: Author | null;
  liked_by_me?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  author_id: string;
  author: Author | null;
};

// Резултат от формуляр (показва грешка или съобщение)
export type FormState = { error?: string; ok?: string } | undefined;
