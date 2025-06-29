import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./common/ScrollToTop";
import SignIn from "./authentication/signin";
import Index from "./home/index";
import Schedule from "./schedule";

function App() {
  return (
   <Router>
    <ScrollToTop/>
    <Routes>
      <Route>
      <Route index path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/schedule" element={<Schedule />} />
      {/* <Route path="/signup" element={<SignUp />} /> */}
      </Route>
    </Routes>
   </Router>
  );
}

export default App;
