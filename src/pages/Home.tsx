import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, PlusCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MeetingCard from "@/components/MeetingCard";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Meeting } from "@/types/meeting";

const QuickActionButton = ({
  icon,
  title,
  to,
}: {
  icon: JSX.Element;
  title: string;
  to: string;
}) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg  transition-all"
  >
    {icon}
    <span className="mt-2 text-sm text-gray-700">{title}</span>
  </Link>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const newTime = Timestamp.fromDate(new Date());

  useEffect(() => {
    const fetchMeetings = async () => {
      setIsLoading(true);
      try {
        const quickSnapshot = await getDocs(collection(db, "meetings"));
        const meetingsData: Meeting[] = quickSnapshot.docs.map((doc) => {
          const data = doc.data() as Meeting;

          return {
            ...data,
            id: doc.id,
            date: data.date instanceof Timestamp ? data.date : newTime,
            deadline:
              data.deadline instanceof Timestamp ? data.deadline : newTime,
            createdAt:
              data.createdAt instanceof Timestamp ? data.createdAt : newTime,
          };
        });

        setMeetings(meetingsData);
      } catch (error) {
        console.error("모임 데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleCreateMeeting = () => {
    console.log("새 모임 만들기");
  };

  const handleJoinMeeting = () => {
    console.log("모임 참여");
  };

  const handleRecentMeetings = () => {
    console.log("최근 모임");
  };

  // 📌 모임 필터링 (예정된 모임 / 지난 모임)
  const upcomingMeetings = meetings
    .filter((meeting) => meeting.date >= newTime)
    .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
  const pastMeetings = meetings
    .filter((meeting) => meeting.date < newTime)
    .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());

  if (isLoading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="h-screen">
      <div className="h-full bg-gray-100 pt-24 flex flex-col">
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
            ) : pastMeetings.length > 0 ? (
              pastMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
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
