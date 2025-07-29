import React, { useState } from "react";
import Input from "../ui/input/InputField";
import Button from "../ui/button/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router";

const JoinMeeting: React.FC = () => {   
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>('');

  const handleJoin = () => {
    if (!user || !user.name || !roomId) {
      alert("You must be logged in and enter a valid Meeting ID");
      return;
    }
    navigate(`/${roomId}`);
  };


  return (
    <div className="flex flex-col sm:flex-row w-full gap-3">
      <div className="w-full sm:w-2/3">
        <Input
          type="text"
          className="ring-2 ring-offset-2 focus:ring-brand-900"
          placeholder="Meeting ID or Personal Link Name"
          id="meeting_link"
          name="meeting_id"
          value={roomId}
          maxLength={250}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </div>

      <div className="w-full sm:w-[35%]">
        <Button
          onClick={handleJoin}
          className="w-full cursor-pointer shadow-lg"
          size="md"
          startIcon={<PlusIcon className="size-5" />}
        >
          Join Meeting
        </Button>
      </div>
    </div>
  );
};

export default JoinMeeting;
