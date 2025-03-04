import { Timestamp } from "firebase/firestore";
import { CalendarCheck, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import GetDday from "@/components/GetDday";

export default function MeetingCard({ meeting }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <Link to={`/meeting/${meeting.id}`} className="block">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{meeting.title}</h3>
          <span className="text-sm text-blue-600">
            {meeting.isVoteEnabled ? "투표 활성화" : "투표 비활성화"}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <CalendarCheck size={16} />
            <span>
              일시:{" "}
              {meeting.date instanceof Timestamp
                ? meeting.date.toDate().toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })
                : meeting.date.split("T")[0]}
            </span>
          </div>
          <strong className="ml-2 text-red-600">{GetDday(meeting.date)}</strong>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <MapPin size={16} />
          <span>장소: {meeting.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users size={16} />
          <span>참석: {meeting.participants.length || 0} 명</span>
        </div>
      </Link>
    </div>
  );
}
