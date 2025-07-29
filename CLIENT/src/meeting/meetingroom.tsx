import React, { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useParams } from "react-router";
import VideoCall from "./videoCall";
import { Layout } from "../Layout/Layout";

const MeetingRoom: React.FC = () => {
  const { user } = useAuth();
  const { meetingId } = useParams<{ meetingId: string }>();


  return (
      <div className="font-outfit w-full h-screen bg-black overflow-hidden">
        {user?.email && meetingId && (
          <VideoCall roomId={meetingId} />
        )}
      </div>
  );
};

export default MeetingRoom;
