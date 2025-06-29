import { useState } from "react";
import Navbar from "../navbar";
import Input from "../ui/input/InputField";
import TextArea from "../ui/input/TextArea";
import Button from "../ui/button/Button";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import timezone from "../../timezone.json";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import Checkbox from "../ui/input/Checkbox";
import Radio from "../ui/input/Radio";

const generateRandomPasscode = () => Math.random().toString(36).slice(2, 8);

const Schedule = () => {
  const [passcode, setPasscode] = useState(generateRandomPasscode());
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [enableChat, setEnableChat] = useState(true);
  const [videoHost, setVideoHost] = useState("on");
  const [videoParticipant, setVideoParticipant] = useState("on");
  const [selectedTimezone, setSelectedTimezone] = useState(timezone[0]);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [passcodeEnabled, setPasscodeEnabled] = useState(true);

  return (
    <div className="font-outfit relative w-full h-screen bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      <div className="absolute top-[80px] bottom-0 left-0 right-0 bg-gray-50 container mx-auto px-4 md:px-10 py-6 overflow-y-auto scroll-auto">
        <div className="p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Schedule Meeting
        </h1>

        <div className="flex flex-col gap-2 md:gap-8 mt-10 max-w-full">
          {/* Topic */}
          <div className="flex flex-col md:flex-row items-start justify-center gap-2 md:gap-8">
            <h2 className="text-xl font-semibold mb-4 w-1/3">Title </h2>
            <Input
              placeholder="e.g. Team Sync Meeting"
              className="min-w-full ring-1 ring-offset-2 bg-white"
            />
          </div>

          {/* Description */}
          <div className="">
            <label className="text-lg font-medium block mb-1">
              Description :
            </label>
            <TextArea
              rows={4}
              placeholder="Optional meeting agenda..."
              className="min-w-full ring-1 ring-offset-2 bg-white"
            />
          </div>

          {/* Date and Time */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4 w-1/3">When</h2>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <label className="text-lg font-medium block mb-1">Date :</label>
                <Input
                  type="date"
                  className="w-full px-4 py-2 bg-white border rounded-md ring-1 ring-offset-2 focus:ring-brand-900"
                />
              </div>
              <div>
                <label className="text-lg font-medium block mb-1">Time :</label>
                <Input
                  type="time"
                  className="w-full px-4 py-2 bg-white border rounded-md ring-1 ring-offset-2 focus:ring-brand-900"
                />
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-semibold mb-4 w-1/3">Time Zone</h2>

            <div className="relative w-full">
              <button
                onClick={() => setIsTimezoneOpen(!isTimezoneOpen)}
                className="w-full flex justify-between items-center px-4 py-2 border rounded-md ring-1 ring-offset-2 focus:ring-brand-900 bg-white"
              >
                <span>{selectedTimezone.time}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform ${
                    isTimezoneOpen ? "rotate-45" : ""
                  }`}
                />
              </button>

              <Dropdown
                isOpen={isTimezoneOpen}
                onClose={() => setIsTimezoneOpen(false)}
                className="max-h-60 overflow-y-auto w-full"
              >
                {timezone.map((tz: any) => (
                  <DropdownItem
                    key={tz.index}
                    onItemClick={() => {
                      setSelectedTimezone(tz);
                      setIsTimezoneOpen(false);
                    }}
                    className="px-4 py-2 bg-white hover:bg-gray-100"
                  >
                    {tz.time} — {tz.name_of_timezone}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-semibold mb-4 w-1/3">Duration (minutes)</h2>
            <Input
              type="number"
              min="1"
              placeholder="30"
              className="w-full ring-1 ring-offset-2 bg-white"
            />
          </div>

          {/* Upload Image */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-semibold mb-4 w-1/3">
              Meeting Image / Profile Picture
            </h2>
            <input
              type="file"
              accept="image/*"
              className="h-11 w-full bg-white rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          {/* Security */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-semibold mb-4 w-1/3">Security</h2>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start mb-3 gap-3">
                <Checkbox
                  label="Passcode"
                  checked={passcodeEnabled}
                  onChange={(checked) => setPasscodeEnabled(checked)}
                />
                <Input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Generate Random Passcode"
                  className="w-40 ring-1 ring-offset-2 bg-white"
                />
                <p className="text-md text-gray-400">
                  Only users who have the invite link or passcode can join the
                  meeting
                </p>
              </div>

              <br />

              <div className="flex flex-col items-start mb-3 gap-3">
                <Checkbox
                  label="Waiting Room"
                  checked={waitingRoom}
                  onChange={(checked) => setWaitingRoom(checked)}
                />
                <p className="text-md text-gray-400">
                  Only users admitted by the host can join the meeting
                </p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-semibold mb-4 w-1/3">Meeting Chat</h2>
            <div className="flex items-start">
              <Checkbox
                label="Enable Chat"
                checked={enableChat}
                onChange={(checked) => setEnableChat(checked)}
              />
              <span className="text-md font-medium">
                Enable Continuous Meeting Chat
              </span>
            </div>
          </div>

          {/* Video */}
          {/* Video */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-semibold mb-4 w-1/3">Video</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col gap-2">
                <p className="font-medium mb-1">Host</p>
                <Radio
                  id="videoHostOn"
                  name="videoHost"
                  value="on"
                  checked={videoHost === "on"}
                  onChange={setVideoHost}
                  label="On"
                />
                <Radio
                  id="videoHostOff"
                  name="videoHost"
                  value="off"
                  checked={videoHost === "off"}
                  onChange={setVideoHost}
                  label="Off"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-medium mb-1">Participant</p>
                <Radio
                  id="videoParticipantOn"
                  name="videoParticipant"
                  value="on"
                  checked={videoParticipant === "on"}
                  onChange={setVideoParticipant}
                  label="On"
                />
                <Radio
                  id="videoParticipantOff"
                  name="videoParticipant"
                  value="off"
                  checked={videoParticipant === "off"}
                  onChange={setVideoParticipant}
                  label="Off"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="self-end pt-6">
            <Button variant="black" className=" text-white font-semibold">
              Schedule Meeting
            </Button>
            <Button
              variant="outline"
              className="ml-4 text-gray-800 font-semibold"
              onClick={() => {
                setPasscode(generateRandomPasscode());
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
