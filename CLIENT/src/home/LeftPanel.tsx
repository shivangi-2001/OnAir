import { CalendarDateRangeIcon } from "@heroicons/react/20/solid";
import Button from "../ui/button/Button";
import { Link } from "react-router-dom";
import InstantMeeting from "./InstantMeeting";
import JoinMeeting from "./JoinMeeting";

const LeftPanel = () => {
  return (
    <div className="grid grid-cols-1 p-10 md:gap-5 w-full xl:w-[80%]">
      {/* Header */}
      <div className="flex flex-col items-start justify-center mb-5">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
          Video calls and meetings for everyone
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Connect instantly with your team, students, or family.
        </p>
      </div>

      {/* Join Meeting Input */}
      <JoinMeeting />

      {/* Create or Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <InstantMeeting />

        <Link to="/schedule" className="shadow-md">
          <Button
            className="cursor-pointer w-full h-full"
            variant="black"
            startIcon={<CalendarDateRangeIcon className="size-5" />}
          >
            Schedule Meeting
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LeftPanel;
