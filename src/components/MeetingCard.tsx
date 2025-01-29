import { CalendarCheck, Users, MapPin } from "lucide-react";

export default function MeetingCard({ meeting }: any) {
  return (
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
}
