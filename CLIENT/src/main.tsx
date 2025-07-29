import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/authContext.tsx";
import { BrowserRouter } from "react-router";
import { MeetProvider } from "./context/meetContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
        <MeetProvider>
          <App />
        </MeetProvider>
    </AuthProvider>
  </BrowserRouter>
);
