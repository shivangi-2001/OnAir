import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./common/ScrollToTop";
import Index from "./home/index";
import Schedule from "./schedule";
import OAuthSuccessPage from "./authentication/oAuthSuccess";
import SignIn from "./authentication/SignIn/SignIn";
import SignUp from "./authentication/SignUp/SignUp";
import { AuthRoute } from "./Layout/AuthLayout";
import MeetingRoom from "./meeting/meetingroom";

function App() {
  
  return (
      <Router>
      <ScrollToTop />
      <Routes>
        <Route index path="/" element={<Index />} />
        <Route path="/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
        <Route path="/signin" element={<AuthRoute><SignIn /></AuthRoute>} />
        <Route path="/oauth/success" element={<OAuthSuccessPage />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/:meetingId" element={<MeetingRoom/>}/>
        
      </Routes>
    </Router>
  );
}

export default App;
