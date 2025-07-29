import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./common/ScrollToTop";
import Index from "./home/index";
import Schedule from "./schedule";
import SignIn from "./authentication/SignIn/SignIn";
import SignUp from "./authentication/SignUp/SignUp";
import { AuthRoute } from "./Layout/AuthLayout"; // Import your AuthRoute
import MeetingRoom from "./meeting/meetingroom";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* Auth Routes - Only for unauthenticated users (redirects if logged in) */}
        <Route element={<AuthRoute requireAuth={false} />}>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Route>

        {/* Protected Routes - Only for authenticated users (redirects to signin if not logged in) */}
        <Route element={<AuthRoute requireAuth={true} />}>
          <Route index path="/" element={<Index />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/:meetingId" element={<MeetingRoom />} />
        </Route>

        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </>
  );
}

export default App;