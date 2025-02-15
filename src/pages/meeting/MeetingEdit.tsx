import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Meeting, User } from "@/types/meeting";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "@/firebase";
import { inviteUser } from "@/utils/inviteUser";

const MeetingEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInviteeEmail, setNewInviteeEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "meetings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMeeting({ id: docSnap.id, ...docSnap.data() } as Meeting);
        }
      } catch (error) {
        console.error("모임 데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!id) return <div>잘못된 모임 ID입니다.</div>;
  if (!meeting) return <div>모임을 찾을 수 없습니다.</div>;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMeeting((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : prev
    );
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              date: Timestamp.fromDate(selectedDate),
            }
          : prev
      );
    }
  };

  const handleDeadlineChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              deadline: Timestamp.fromDate(selectedDate),
            }
          : prev
      );
    }
  };

  const handleInvite = async () => {
    await inviteUser(
      newInviteeEmail,
      meeting.invitees,
      setMeeting,
      setInviteError
    );
    setNewInviteeEmail(""); // 입력 필드 초기화
  };

  const removeInvitee = (uid: string) => {
    setMeeting((prev) =>
      prev
        ? {
            ...prev,
            invitees: prev.invitees.filter((invitee) => invitee.uid !== uid),
          }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 파이어베이스에 id의 업데이트는 필요 없음.
      const { id, ...meetingData } = meeting;
      const docRef = doc(db, "meetings", id);
      await updateDoc(docRef, meetingData);
      navigate(`/meeting/${id}`);
    } catch (error) {
      console.error("Error adding meeting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 py-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">모임 제목</label>
          <Input
            name="title"
            value={meeting.title}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block mb-2">모임 설명</label>
          <Textarea
            name="description"
            value={meeting.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-2">모임 날짜</label>
            <Calendar
              mode="single"
              selected={
                meeting.date instanceof Timestamp
                  ? meeting.date.toDate()
                  : meeting.date
              }
              onSelect={handleDateChange}
              className="rounded-md border"
            />
          </div>

          <div>
            <label className="block mb-2">투표 마감일</label>
            <Calendar
              mode="single"
              selected={
                meeting.date instanceof Timestamp
                  ? meeting.date.toDate()
                  : meeting.date
              }
              onSelect={handleDeadlineChange}
              className="rounded-md border"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">장소</label>
          <Input
            name="location"
            value={meeting.location}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={meeting.isVoteEnabled}
            onCheckedChange={(checked) =>
              setMeeting((prev) =>
                prev ? { ...prev, isVoteEnabled: checked } : prev
              )
            }
          />
          <label>투표 활성화</label>
        </div>

        <div>
          <label className="block mb-2">초대자</label>
          <div className="flex space-x-2 mb-2">
            <Input
              type="email"
              value={newInviteeEmail}
              onChange={(e) => setNewInviteeEmail(e.target.value)}
              placeholder="이메일 주소"
            />
            <Button type="button" onClick={handleInvite}>
              초대
            </Button>
          </div>

          <div className="space-y-2">
            {meeting.invitees.map((invitee) => (
              <div
                key={invitee.uid}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <div>
                  <p>{invitee.displayName || "이름 없음"}</p>
                  <p className="text-sm text-gray-500">{invitee.email}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeInvitee(invitee.uid)}
                  disabled={isSubmitting}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={!meeting || isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={!meeting || isSubmitting}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MeetingEdit;
