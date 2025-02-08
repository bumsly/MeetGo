import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Participant {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "host" | "participant";
  joinedAt: Timestamp;
}

export interface Meeting {
  id: string;
  title: string;
  date: Timestamp;
  location: string;
  description: string;
  deadline: Timestamp;
  isVoteEnabled: boolean;
  invitees: User[];
  createdAt: Timestamp;
  createdBy: User;
  participants: Participant[];
}
