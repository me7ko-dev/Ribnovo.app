import { longDate, time } from "./format";
import { sendPush } from "./push";

// Известие за ново одобрено събитие
export async function notifyEvent(
  id: string,
  category: "events" | "memorial",
  title: string,
  startsAt: string,
  location: string | null,
) {
  await sendPush(category, {
    title: `${category === "memorial" ? "Възпоменание" : "Ново събитие"}: ${title}`,
    body: `${longDate(startsAt)}, ${time(startsAt)}${location ? ` · ${location}` : ""}`,
    url: `/sabitiya/${id}`,
  });
}
