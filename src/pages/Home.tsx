import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Users, PlusCircle, Clock, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// 더미 데이터 (실제로는 API에서 가져올 데이터)
const upcomingMeetings = [
  {
    id: 1,
    title: "팀 프로젝트 회의",
    date: "2024.02.15",
    time: "14:00",
    location: "온라인 회의",
    participants: 5,
    status: "투표 진행중",
  },
  {
    id: 2,
    title: "친구들과 번개 모임",
    date: "2024.02.20",
    time: "19:00",
    location: "강남 카페",
    participants: 4,
    status: "일정 조율중",
  },
  {
    id: 3,
    title: "동아리 정기 모임",
    date: "2024.02.25",
    time: "18:00",
    location: "학교 세미나실",
    participants: 6,
    status: "확정",
  },
  {
    id: 4,
    title: "프로젝트 중간 보고회",
    date: "2024.03.01",
    time: "15:30",
    location: "회의실",
    participants: 7,
    status: "투표 예정",
  },
  {
    id: 5,
    title: "친목 모임",
    date: "2024.03.10",
    time: "20:00",
    location: "강릉 펜션",
    participants: 8,
    status: "일정 조율중",
  },
];

const QuickActionButton = ({ icon, title, to }: any) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
  >
    {icon}
    <span className="mt-2 text-sm text-gray-700">{title}</span>
  </Link>
);

const MeetingCard = ({ meeting }: any) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold text-lg">{meeting.title}</h3>
      <span className="text-sm text-blue-600">{meeting.status}</span>
    </div>
    <div className="flex items-center space-x-2 text-gray-600 mb-2">
      <CalendarCheck size={16} />
      <span>
        {meeting.date} {meeting.time}
      </span>
    </div>
    <div className="flex items-center space-x-2 text-gray-600 mb-2">
      <MapPin size={16} />
      <span>{meeting.location}</span>
    </div>
    <div className="flex items-center space-x-2 text-gray-600">
      <Users size={16} />
      <span>{meeting.participants}명 참여</span>
    </div>
  </div>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const handleCreateMeeting = () => {
    console.log("새 모임 만들기");
  };

  const handleJoinMeeting = () => {
    console.log("모임 참여");
  };

  const handleRecentMeetings = () => {
    console.log("최근 모임");
  };

  return (
    <div className="h-screen">
      <div className="h-screen bg-gray-100 pt-24 flex flex-col">
        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-3 gap-4 mb-6 px-4">
          <QuickActionButton
            icon={<PlusCircle size={32} className="text-blue-600" />}
            title="새 모임"
            to="/create-meeting"
          />
          <QuickActionButton
            icon={<Users size={32} className="text-green-600" />}
            title="모임 참여"
            to="/join-meeting"
          />
          <QuickActionButton
            icon={<Clock size={32} className="text-purple-600" />}
            title="최근 모임"
            to="/recent-meetings"
          />
        </div>

        {/* 모임 탭 */}
        <div className="flex border-b px-4 mb-4">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 pb-2 ${
              activeTab === "upcoming"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            예정된 모임
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 pb-2 ${
              activeTab === "past"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            지난 모임
          </button>
        </div>

        {/* 모임 목록 */}
        <div className="flex-1 px-4 overflow-hidden pb-[80px]">
          <ScrollArea className="h-full overflow-y-auto pr-2">
            {activeTab === "upcoming" ? (
              upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  예정된 모임이 없습니다.
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                지난 모임이 없습니다.
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
