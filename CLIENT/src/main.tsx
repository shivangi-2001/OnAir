import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/authContext.tsx";
import { MeetProvider } from "./context/meetContext.tsx";

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <MeetProvider>
      <App />
      </MeetProvider>
    </AuthProvider>
);
