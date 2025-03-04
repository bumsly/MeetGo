import {
  Timestamp,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/types/meeting";
import { FriendRequest } from "@/types/friend";

const useFriendActions = (
  currentUser: User | null,
  setReceivedRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>
) => {
  const sendFriendRequest = async (toUser: User | null) => {
    if (!currentUser || !toUser || !toUser.uid) {
      console.error("Invalid user data: ", { currentUser, toUser });
      return;
    }

    try {
      const newRequest = {
        from: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
        },
        to: {
          uid: toUser.uid,
          displayName: toUser.displayName || "",
          email: toUser.email || "",
        },
        status: "pending",
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "friendRequests"), newRequest);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleRequestResponse = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, {
        status,
      });

      if (status === "accepted") {
        const requestDoc = await getDoc(requestRef);
        const requestData = requestDoc.data() as FriendRequest;

        await addDoc(collection(db, "friends"), {
          userIds: [requestData.from.uid, requestData.to.uid],
          users: [
            {
              uid: requestData.from.uid,
              displayName: requestData.from.displayName || "",
              email: requestData.from.email || "",
            },
            {
              uid: requestData.to.uid,
              displayName: requestData.to.displayName || "",
              email: requestData.to.email || "",
            },
          ],
          createdAt: Timestamp.now(),
        });
      }

      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  return { sendFriendRequest, handleRequestResponse };
};

export default useFriendActions;
