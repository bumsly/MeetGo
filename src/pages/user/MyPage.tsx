import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserData {
  birthday: string;
  phoneNumber: string;
  email: string;
  name: string;
  createdAt: Timestamp;
}

export default function MyPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const createdAtDate = userData?.createdAt?.toDate();

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  if (!user) {
    useEffect(() => {
      navigate("/login");
    }, []);
    return null;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            console.error("사용자 데이터가 없습니다.");
          }
        }
      } catch (error) {
        console.error("사용자 데이터 가져오기 실패", error);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-10">
        <div className="flex items-center space-x-6">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="프로필 사진"
              className="w-24 h-24 rounded-full object-cover border"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">계정 정보</h2>
            <p>이메일: {user.email}</p>
            <p>
              가입일:{" "}
              {createdAtDate ? formatDate(createdAtDate) : "데이터 없음"}
            </p>
            <p>
              생일:{" "}
              {userData?.birthday.slice(4, 6) +
                "월 " +
                userData?.birthday.slice(6, 8) +
                "일"}
            </p>
            <p>
              전화번호:{" "}
              {userData?.phoneNumber.slice(0, 3) +
                "-" +
                userData?.phoneNumber.slice(3, 7) +
                "-" +
                userData?.phoneNumber.slice(7, 11)}
            </p>
          </div>

          {/* 추가 설정이나 정보를 여기에 표시 */}

          <button
            onClick={handleLogout}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
