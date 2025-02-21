import { Timestamp } from "firebase/firestore";

export default function GetDday(date: Timestamp | string) {
  const eventDate = date instanceof Timestamp ? date.toDate() : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  const diff = Math.floor(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return "D-Day";
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}
