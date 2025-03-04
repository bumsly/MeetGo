import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, UserPlus } from "lucide-react";
import { Meeting, Participant } from "@/types/meeting";
import GetDday from "@/components/GetDday";

interface MeetingFirestore extends Omit<Meeting, "id"> {
  // Firebase 문서의 타입
}

const MeetingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!id) {
        setError("잘못된 모임 ID입니다.");
        setLoading(false);
        return;
      }

      try {
        const meetingDoc = await getDoc(doc(db, "meetings", id));

        if (meetingDoc.exists()) {
          const meetingData = meetingDoc.data() as MeetingFirestore;
          setMeeting({
            id: meetingDoc.id,
            ...meetingData,
            participants: meetingData.participants.map((p) => ({
              ...p,
              joinedAt: p.joinedAt,
            })),
          });
        } else {
          setError("모임을 찾을 수 없습니다.");
        }
      } catch (err) {
        setError("모임 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching meeting:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [id]);

  const handleJoinMeeting = async () => {
    if (!user || !meeting) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const meetingRef = doc(db, "meetings", meeting.id);

      const newParticipant: Participant = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        role: "participant",
        joinedAt: Timestamp.now(),
      };

      await runTransaction(db, async (transaction) => {
        const meetingDoc = await transaction.get(meetingRef);
        if (!meetingDoc.exists()) throw new Error("모임이 존재하지 않습니다.");

        transaction.update(meetingRef, {
          participants: arrayUnion(newParticipant),
          invitees: arrayRemove(
            meeting.invitees.find((i) => i.email === user.email)
          ),
        });
      });

      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: [...prev.participants, newParticipant],
              invitees: prev.invitees.filter(
                (invitee) => invitee.email !== user.email
              ),
            }
          : null
      );

      alert("모임 참여가 완료되었습니다!");
    } catch (error) {
      console.error("Error joining meeting:", error);
      alert("모임 참여 중 오류가 발생했습니다.");
    }
  };

  const handleLeaveMeeting = async () => {
    if (!user || !meeting) return;

    try {
      const meetingRef = doc(db, "meetings", meeting.id);

      const participant = meeting.participants.find(
        (p: any) => p.uid === user.uid
      );

      if (!participant) return;

      await runTransaction(db, async (transaction) => {
        const meetingDoc = await transaction.get(meetingRef);
        if (!meetingDoc.exists()) throw new Error("모임이 존재하지 않습니다.");

        transaction.update(meetingRef, {
          participants: arrayRemove(participant),
          invitees: arrayUnion({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
          }),
        });
      });

      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter(
                (participant) => participant.email !== user.email
              ),
              invitees: [
                ...prev.invitees,
                {
                  uid: user.uid,
                  email: user.email || "",
                  displayName: user.displayName || "",
                },
              ],
            }
          : null
      );
      console.log(meeting);
      alert("모임 참여가 취소되었습니다.");
    } catch (error) {
      console.error("Error leaving meeting:", error);
      alert("모임 취소 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteMeeting = async () => {
    if (!window.confirm("정말 이 모임을 삭제하시겠습니까?")) return;

    try {
      if (!meeting || !meeting.id) return;

      const docRef = doc(db, "meetings", meeting.id);
      await deleteDoc(docRef);

      alert("모임이 삭제되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("모임 삭제 중 오류 발생:", error);
      alert("모임 삭제에 실패했습니다.");
    }
  };

  if (loading || error || !meeting) {
    return (
      <div className="flex items-center justify-center h-screen">
        {loading ? "로딩 중..." : error ? error : "모임을 찾을 수 없습니다."}
      </div>
    );
  }

  const isParticipant = meeting.participants.some((p) => p.uid === user?.uid);
  const isHost = meeting.createdBy.uid === user?.uid;
  const meetingDate = meeting.date.toDate();

  return (
    <div className="pb-24">
      <div className="container mx-auto p-4 max-w-4xl pt-24">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {meeting.title}
              </CardTitle>
              {isHost && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/meeting/${id}/edit`)}
                >
                  수정
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    일시:{" "}
                    {meetingDate.toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    {meetingDate.toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <strong className="ml-2 mr-1 text-red-600">
                  {GetDday(meeting.date)}
                </strong>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>장소: {meeting.location}</span>
              </div>
            </div>

            {/* 주최자 정보 */}
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-yellow-500 pt-1">
                  {meeting.createdBy.displayName
                    ? meeting.createdBy.displayName[0]
                    : "익명"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{meeting.createdBy.displayName}</p>
                <p className="text-sm text-gray-500">주최자</p>
              </div>
            </div>

            {/* 참여자 목록 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">
                  참여자 ({meeting.participants.length}명)
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((participant) => (
                  <div
                    key={participant.uid}
                    className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{participant.displayName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 초대 받은 사람 목록 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-semibold">
                  초대 대기중 ({meeting.invitees.length}명)
                </h3>
              </div>
            </div>

            {/* 참여/취소 버튼 */}
            {!isHost && (
              <div className="flex justify-center pt-4">
                {isParticipant ? (
                  <Button
                    variant="outline"
                    onClick={handleLeaveMeeting}
                    className="w-full max-w-md"
                  >
                    참여 취소하기
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinMeeting}
                    className="w-full max-w-md"
                  >
                    참여하기
                  </Button>
                )}
              </div>
            )}

            {/* 모임 설명 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{meeting.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mx-auto p-4 pt-0 max-w-4xl">
        <Button className="w-full bg-red-500" onClick={handleDeleteMeeting}>
          삭제
        </Button>
      </div>
      <div className="mx-auto px-4 max-w-4xl">
        <Button className="w-full bg-gray-500" onClick={() => navigate(-1)}>
          뒤로 가기
        </Button>
      </div>
    </div>
  );
};

export default MeetingDetail;
