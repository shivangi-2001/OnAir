import React from "react";
import { useNavigate } from "react-router-dom";
import { VideoCameraIcon } from "@heroicons/react/20/solid";
import Button from "../ui/button/Button";
import { useMeeting } from "../context/meetContext";

const InstantMeeting: React.FC = () => {
  const navigate = useNavigate();
  const { createInstantMeeting } = useMeeting();

  const handleCreateMeeting = async () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      const meetingId = await createInstantMeeting(timezone);
      navigate(`/${meetingId}`);
    } catch (err: any) {
      console.error("Failed to create meeting:", err.message);
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <Button
      onClick={handleCreateMeeting}
      className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 font-bold"
      startIcon={<VideoCameraIcon className="size-5" />}
    >
      New Instant Meeting
    </Button>
  );
};

export default InstantMeeting;
