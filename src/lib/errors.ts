// Съобщения за грешки от Supabase — на български

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "Грешен имейл или парола.",
  email_not_confirmed: "Първо потвърдете имейла си — проверете пощата (и папка „Спам“).",
  user_already_exists: "Вече има профил с този имейл. Опитайте да влезете.",
  email_exists: "Вече има профил с този имейл. Опитайте да влезете.",
  phone_exists: "Вече има профил с този телефон.",
  weak_password: "Паролата е твърде слаба. Използвайте поне 8 знака.",
  over_email_send_rate_limit: "Изпратени са твърде много имейли. Опитайте отново след малко.",
  over_sms_send_rate_limit: "Изпратени са твърде много SMS-и. Опитайте отново след малко.",
  over_request_rate_limit: "Твърде много опити. Изчакайте малко и опитайте пак.",
  phone_provider_disabled: "Входът с телефон още не е включен. Влезте с имейл.",
  sms_send_failed: "Не успяхме да изпратим SMS. Проверете номера или влезте с имейл.",
  otp_expired: "Кодът е изтекъл или е грешен. Поискайте нов.",
  same_password: "Новата парола трябва да е различна от старата.",
  signup_disabled: "Регистрацията е временно спряна.",
  email_address_invalid: "Невалиден имейл адрес.",
  validation_failed: "Проверете въведените данни.",
};

export function authErrorMessage(error: { code?: string; message: string }) {
  if (error.code && AUTH_ERRORS[error.code]) return AUTH_ERRORS[error.code];
  console.error("Грешка при вход:", error.code, error.message);
  return "Нещо се обърка. Опитайте отново.";
}

export function dbErrorMessage(error: { message: string }) {
  console.error("Грешка в базата:", error.message);
  if (error.message.includes("row-level security")) return "Нямате права за това действие.";
  return "Нещо се обърка. Опитайте отново.";
}
