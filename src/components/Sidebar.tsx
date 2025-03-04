import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, User, Settings, Sun, Moon, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

const Sidebar = ({ isOpen, setIsOpen, isDarkMode, setIsDarkMode }: any) => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.log("로그아웃 에러", error);
    }
  };

  useEffect(() => {
    // 현재 사용자 정보 가져오기
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);

        // Firebase에서 추가 정보 가져오기
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  // 사이드바 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isOpen && !event.target.closest(".sidebar-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative bg-blue-600">
      {/* 사이드바 */}
      <div
        className={`sidebar-container fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-50`}
      >
        <div className="flex flex-col h-full p-4">
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={24} />
          </button>

          {/* 프로필 섹션 */}
          <div className="flex items-center space-x-4 p-4 border-b dark:border-gray-700">
            {!isLoading ? (
              user ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={user.photoURL || "/default-avatar.png"}
                    alt="프로필 사진"
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"
                  />
                  <div>
                    <p className="font-medium">
                      {userData?.name || "이름 없음"}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ) : (
                <Link to={"/login"} className="text-red-600 hover:underline">
                  로그인
                </Link>
              )
            ) : (
              <p className="text-gray-500">로딩 중...</p>
            )}
            {/* <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div>
              {isLoggedIn ? (
                <div>
                  <p className="font-medium">사용자 이름</p>
                  <p className="text-sm text-gray-500">user@example.com</p>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="text-blue-600 hover:underline"
                >
                  로그인
                </button>
              )}
            </div> */}
          </div>

          {/* 메뉴 */}
          <nav className="mt-4 pb-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/mypage"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={20} className="mr-3" />
                  마이페이지
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 drak:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={20} className="mr-3" />
                  설정
                </Link>
              </li>
            </ul>
          </nav>

          <div className="border-t dark:border-gray-700 pt-4">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDarkMode ? "라이트 모드" : "다크 모드"}</span>
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut size={20} />
                <span>로그아웃</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 배경 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
