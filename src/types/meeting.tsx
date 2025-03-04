import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface Invitee {
  uid: string;
  email: string;
  displayName: string;
}

export interface Participant {
  uid: string;
  email: string;
  displayName: string;
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
  invitees: Invitee[];
  createdAt: Timestamp;
  createdBy: User;
  participants: Participant[];
}
