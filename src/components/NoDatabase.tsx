import { Notice } from "./FormMessage";

// Показва се, докато Supabase не е свързан
export function NoDatabase() {
  return (
    <Notice tone="info">
      Базата данни още не е свързана, затова входът и публикуването не работят. Вижте README.md → „Свързване със
      Supabase“.
    </Notice>
  );
}
