import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timestamp, addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

const MeetingNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date(),
    time: "",
    location: "",
    description: "",
    deadline: new Date(),
    isVoteEnabled: false,
    invitees: [],
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      const [hours, minutes] = formData.time.split(":").map(Number);
      const meetingDate = new Date(formData.date);
      meetingDate.setHours(hours, minutes, 0, 0);

      const meetingData = {
        title: formData.title,
        date: Timestamp.fromDate(meetingDate),
        location: formData.location,
        description: formData.description,
        deadline: Timestamp.fromDate(formData.deadline),
        isVoteEnabled: formData.isVoteEnabled,
        invitees: formData.invitees,
        createdAt: Timestamp.now(),
        createdBy: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "익명",
        },
        status: "active",
        participants: [
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "익명",
            role: "host",
            joinedAt: Timestamp.now(),
          },
        ],
      };

      const meetingRef = await addDoc(collection(db, "meetings"), meetingData);

      await setDoc(doc(db, "users", user.uid, "meetings", meetingRef.id), {
        meetingId: meetingRef.id,
        role: "host",
        joinedAt: Timestamp.now(),
      });

      alert("모임이 성공적으로 생성되었습니다!");
      navigate(`/meeting-detail/${meetingRef.id}`);
    } catch (error) {
      console.error("모임 생성 에러:", error);
      alert("모임 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl py-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">새로운 모임 만들기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 모임 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">모임 제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="모임 제목을 입력하세요"
                className="w-full"
                required
              />
            </div>

            {/* 날짜 선택 */}
            <div className="space-y-2">
              <Label>모임 날짜</Label>
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => setFormData({ ...formData, date })}
                className="rounded-md border"
              />
            </div>

            {/* 시간 선택 */}
            <div className="space-y-2">
              <Label htmlFor="time">모임 시간</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* 장소 선택 (카카오맵 통합 필요) */}
            <div className="space-y-2">
              <Label htmlFor="location">모임 장소</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="장소를 선택하세요"
                className="w-full"
                required
              />
              {/* 카카오맵 컴포넌트가 여기에 들어갈 예정 */}
              <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                카카오맵 영역
              </div>
            </div>

            {/* 모임 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">모임 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="모임에 대해 설명해주세요"
                className="min-h-[100px]"
                required
              />
            </div>

            {/* 데드라인 설정 */}
            <div className="space-y-2">
              <Label>참여 마감일</Label>
              <Calendar
                mode="single"
                selected={formData.deadline}
                onSelect={(date) =>
                  setFormData({ ...formData, deadline: date })
                }
                className="rounded-md border"
              />
            </div>

            {/* 투표 기능 ON/OFF */}
            <div className="flex items-center space-x-2">
              <Switch
                id="vote-mode"
                checked={formData.isVoteEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVoteEnabled: checked })
                }
              />
              <Label htmlFor="vote-mode">투표 기능 활성화</Label>
            </div>

            {/* 초대 기능 */}
            <div className="space-y-2">
              <Label>참여자 초대</Label>
              <div className="flex space-x-2">
                <Input placeholder="이메일 주소 입력" className="flex-1" />
                <Button type="button" variant="outline">
                  추가
                </Button>
              </div>
              {/* 초대된 참여자 목록이 여기에 표시될 예정 */}
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "생성 중..." : "모임 만들기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* 
        날짜, 시간 선택 (데이트 피커)
        초대 기능
        장소 (카카오맵)
        모임 설명
        데드라인
        투표 on/off */}
    </div>
  );
};

export default MeetingNew;
