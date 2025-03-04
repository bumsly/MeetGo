import { Timestamp } from "firebase/firestore";
import { User } from "./meeting";

export interface FriendRequest {
  id: string;
  from: User;
  to: User;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}
