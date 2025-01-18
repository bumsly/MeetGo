import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./global.css";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NavigationTop from "./components/NavigationTop";
import NavigationBottom from "./components/NavigationBottom";
import MyMeeting from "./pages/user/MyMeeting";
import MyPage from "./pages/user/MyPage";
import MeetingNew from "./pages/meeting/MeetingNew";
import MeetingEdit from "./pages/meeting/MeetingEdit";
import MeetingDetail from "./pages/meeting/MeetingDetail";
import MeetingResult from "./pages/meeting/MeetingResult";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function Layout() {
  const location = useLocation();

  const hideNavi = ["/login", "/signup"];

  const showNavi = !hideNavi.includes(location.pathname);

  return (
    <AuthProvider>
      {showNavi && <NavigationTop />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mymeeting" element={<MyMeeting />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route path="/meetingnew" element={<MeetingNew />} />
        <Route path="/meetingedit" element={<MeetingEdit />} />
        <Route path="/meetingdetail" element={<MeetingDetail />} />
        <Route path="/meetingresult" element={<MeetingResult />} />
      </Routes>
      {showNavi && <NavigationBottom />}
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
