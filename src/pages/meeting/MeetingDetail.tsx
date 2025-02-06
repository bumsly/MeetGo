import { useParams } from "react-router-dom";

export default function MeetingDetail() {
  const { id } = useParams();

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1>모임 상세 페이지</h1>
      <p>모임 Id: {id}</p>
    </div>
  );
}
