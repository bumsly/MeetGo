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
import Settings from "./pages/Settings";
import MeetingNew from "./pages/meeting/MeetingNew";
import MeetingEdit from "./pages/meeting/MeetingEdit";
import MeetingDetail from "./pages/meeting/MeetingDetail";
import MeetingResult from "./pages/meeting/MeetingResult";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Friend from "./pages/friend/Friend";
import Notification from "./pages/Notification";

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
        <Route path="/my-meeting" element={<MyMeeting />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-meeting" element={<MeetingNew />} />
        <Route path="/meeting/:id" element={<MeetingDetail />} />
        <Route path="/meeting/:id/edit" element={<MeetingEdit />} />
        <Route path="/meeting/:id/result" element={<MeetingResult />} />
        <Route path="/friend" element={<Friend />} />
        <Route path="/notification" element={<Notification />} />
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
