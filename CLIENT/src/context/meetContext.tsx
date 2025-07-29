import React, { createContext, useContext, useState } from "react";


interface UserType {
  name: string;
  email: string;
  profile: string;
}

interface MeetingAudienceType {
  name: string;
  email: string;
}

interface MeetingDataType {
  meetingId: string;
  host: UserType;
  audiences: MeetingAudienceType[];
  createdAt?: string;
  ended?: boolean;
}

interface MeetContextType {
  meetingData: MeetingDataType | null;
  loading: boolean;
  createInstantMeeting: (timezone: string) => Promise<string>;
  joinMeeting: (meetingId: string) => Promise<MeetingDataType>;
  endMeeting: (meetingId: string) => Promise<{ message: string }>;
}

const MeetContext = createContext<MeetContextType | undefined>(undefined);

interface MeetProviderProps {
  children: React.ReactNode;
}

export const MeetProvider = ({ children }: MeetProviderProps) => {
  const [meetingData, setMeetingData] = useState<MeetingDataType | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;

  const createInstantMeeting = async (timezone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/meeting/instant_link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ timezone }),
      });
      if (!res.ok) throw new Error("Failed to create meeting");
      const data: MeetingDataType = await res.json();
      setMeetingData(data);
      localStorage.setItem("meetingId", data.meetingId);
      return data.meetingId;
    } catch (err) {
      console.error("Instant meeting error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = async (meetingId: string) => {
    setLoading(true);
    try {
      const resJoin = await fetch(`${API_BASE}/meeting/${meetingId}/join`, {
        method: "POST",
        credentials: "include",
      });
      if (!resJoin.ok) throw new Error("Failed to join meeting");

      const resDetails = await fetch(`${API_BASE}/meeting/${meetingId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!resDetails.ok) throw new Error("Meeting not found or ended");

      const data: MeetingDataType = await resDetails.json();
      setMeetingData(data);
      localStorage.setItem("meetingId", data.meetingId);
      return data;
    } catch (err) {
      console.error("Join meeting error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const endMeeting = async (meetingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/meeting/${meetingId}/end`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to end meeting");
      const data = await res.json();
      setMeetingData(null);
      localStorage.removeItem("meetingId");
      return data;
    } catch (err) {
      console.error("End meeting error:", err);
      throw err;
    }
  };

  return (
    <MeetContext.Provider
      value={{
        meetingData,
        loading,
        createInstantMeeting,
        joinMeeting,
        endMeeting,
      }}
    >
      {children}
    </MeetContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetContext);
  if (!context) {
    throw new Error("useMeeting must be used within a MeetProvider");
  }
  return context;
};
