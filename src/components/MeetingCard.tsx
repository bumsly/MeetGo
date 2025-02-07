import { Timestamp } from "firebase/firestore";
import { CalendarCheck, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function MeetingCard({ meeting }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <Link to={`/meeting/${meeting.id}`} className="block">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{meeting.title}</h3>
          <span className="text-sm text-blue-600">{meeting.status}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <CalendarCheck size={16} />
          <span>
            {meeting.date instanceof Timestamp
              ? meeting.date.toDate().toLocaleString()
              : meeting.date.split("T")[0]}{" "}
            {meeting.time}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <MapPin size={16} />
          <span>{meeting.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users size={16} />
          <span>{meeting.participants || 0}명 참여</span>
        </div>
      </Link>
    </div>
  );
}
