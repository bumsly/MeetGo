import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users } from "lucide-react";
import { Meeting, Participant } from "@/types/meeting";

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
      const newParticipant: Participant = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "익명",
        role: "participant",
        joinedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, "meetings", meeting.id), {
        participants: arrayUnion(newParticipant),
      });

      setMeeting((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          participants: [...prev.participants, newParticipant],
        };
      });

      alert("모임 참여가 완료되었습니다!");
    } catch (error) {
      console.error("Error joining meeting:", error);
      alert("모임 참여 중 오류가 발생했습니다.");
    }
  };

  const handleLeaveMeeting = async () => {
    if (!user || !meeting) return;

    try {
      const participant = meeting.participants.find(
        (p: any) => p.uid === user.uid
      );
      if (!participant) return;

      await updateDoc(doc(db, "meetings", meeting.id), {
        participants: arrayRemove(participant),
      });

      setMeeting((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          participants: prev.participants.filter(
            (p: any) => p.uid !== user.uid
          ),
        };
      });

      alert("모임 참여가 취소되었습니다.");
    } catch (error) {
      console.error("Error leaving meeting:", error);
      alert("모임 취소 중 오류가 발생했습니다.");
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
                onClick={() => navigate(`/meetings/${id}/edit`)}
              >
                수정
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>
                {meetingDate.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>
                {meetingDate.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{meeting.location}</span>
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
                <Button onClick={handleJoinMeeting} className="w-full max-w-md">
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
  );
};

export default MeetingDetail;
