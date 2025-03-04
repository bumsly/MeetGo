import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "@/types/meeting";
import { FriendRequest } from "@/types/friend";

const useFriends = (currentUser: User | null) => {
  const [friends, setFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const friendsQuery = query(
          collection(db, "friends"),
          where("userIds", "array-contains", currentUser.uid)
        );

        const sentQuery = query(
          collection(db, "friendRequests"),
          where("from.uid", "==", currentUser.uid)
        );

        const receivedQuery = query(
          collection(db, "friendRequests"),
          where("to.uid", "==", currentUser.uid)
        );

        // 쿼리 병렬 실행
        const [friendsData, sentData, receivedData] = await Promise.all([
          getDocs(friendsQuery),
          getDocs(sentQuery),
          getDocs(receivedQuery),
        ]);

        setFriends(
          friendsData.docs
            .flatMap((doc) => doc.data().users || [])
            .filter((user: User) => user.uid !== currentUser.uid)
        );

        setSentRequests(
          sentData.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as FriendRequest)
          )
        );
        setReceivedRequests(
          receivedData.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as FriendRequest)
          )
        );
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return {
    friends,
    sentRequests,
    receivedRequests,
    setReceivedRequests,
    isLoading,
  };
};

export default useFriends;
