import React, { useEffect } from "react";
import { useAuth } from "../context/authContext";
import VideoCall from "./videoCall";

const MeetingRoom: React.FC = () => {
  const {user} = useAuth();

  useEffect(() => {
    if(user?.email){
      console.log("current dashboard belong to: ", user?.name);
    }
  }, [user])
  
  return (
    <div className="font-outfit w-full h-screen bg-black overflow-hidden">
      <VideoCall/>
    </div>
  );
};

export default MeetingRoom;
