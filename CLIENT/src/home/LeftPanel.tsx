import {
  CalendarDateRangeIcon,
  PlusIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";
import Button from "../ui/button/Button";
import Input from "../ui/input/InputField";
import { Link } from "react-router";

const LeftPanel = () => {
  return (
    <div className="grid grid-cols-1 p-10 md:gap-5 w-full xl:w-[80%]">
      <div className="flex flex-col items-start justify-center mb-5">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
          Video calls and meetings for everyone
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Connect instantly with your team, students, or family.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-3">
        <div className="w-full sm:w-2/3">
          <Input
            className="ring-2 ring-offset-2 focus:ring-brand-900"
            placeholder="Meeting ID or Personal Link Name"
            id="meeting_link"
          />
        </div>

        <div className="w-full sm:w-[35%]">
          <Button
            className="w-full cursor-pointer shadow-lg"
            size="md"
            startIcon={<PlusIcon className="size-5" />}
          >
            Join Meeting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 font-bold"
          startIcon={<VideoCameraIcon className="size-5"></VideoCameraIcon>}
        >
          New Instant Meeting
        </Button>

        <Link to="/schedule" className="shadow-md">
          <Button
            className="cursor-pointer w-full h-full"
            variant="black"
            startIcon={
              <CalendarDateRangeIcon className="size-5"></CalendarDateRangeIcon>
            }
          >
            Schedule Meeting
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LeftPanel;
