import { useState } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/types/meeting";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Check, UserMinus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import useFriendActions from "@/hooks/useFriendActions";
import useFriends from "@/hooks/useFriends";

export default function Friend() {
  const { user } = useAuth();
  const {
    friends,
    sentRequests,
    receivedRequests,
    setReceivedRequests,
    isLoading,
  } = useFriends(user as User);
  const { sendFriendRequest, handleRequestResponse } = useFriendActions(
    user as User,
    setReceivedRequests
  );
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);

  const handleSearch = async () => {
    if (!searchEmail) return;

    try {
      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", searchEmail)
      );
      const querySnapshot = await getDocs(usersQuery);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as User;

        if (userData.uid) {
          setSearchResult(userData);
          console.log("userData: ", userData);
        } else {
          console.error("User data does not contain uid:", userData);
          setSearchResult(null);
        }
      } else {
        setSearchResult(null);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 pt-28">
      <h1 className="text-2xl font-bold mb-6">친구 관리</h1>

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="friends">친구 목록</TabsTrigger>
          <TabsTrigger value="requests">친구 요청</TabsTrigger>
          <TabsTrigger value="add">친구 추가</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card>
            <CardContent className="pt-6">
              {friends.length === 0 ? (
                <p className="text-center text-gray-500">
                  아직 친구가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.uid}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{friend.displayName}</p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          /* TODO: 친구 삭제 */
                        }}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">받은 요청</h3>
                {receivedRequests.length === 0 ? (
                  <p className="text-center text-gray-500">
                    받은 요청이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {receivedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {request.from.displayName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.from.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleRequestResponse(request.id, "accepted")
                            }
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRequestResponse(request.id, "rejected")
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">보낸 요청</h3>
                {sentRequests.length === 0 ? (
                  <p className="text-center text-gray-500">
                    보낸 요청이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {request.to.displayName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.to.email}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.status === "pending"
                            ? "대기 중"
                            : request.status === "accepted"
                            ? "수락됨"
                            : "거절됨"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 mb-4">
                <Input
                  type="email"
                  placeholder="친구 이메일 검색"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
                <Button onClick={handleSearch}>검색</Button>
              </div>

              <div className="space-y-2">
                {searchResult ? (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{searchResult.displayName}</p>
                      <p className="text-sm text-gray-500">
                        {searchResult.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(searchResult)}
                    >
                      친구 추가
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    검색 결과가 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
