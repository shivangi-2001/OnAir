import { useState } from "react";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { DropdownItem } from "./ui/dropdown/DropdownItem";

const getFormattedDateTime = () => {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  return { time, date: `${month}, ${day} ${weekday}` };
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="relative p-3 md:px-10 h-16 shadow-theme-md border-b-2 bg-brand-200 border-brand-400 flex justify-between">
      <img src="logo.png" alt="onAir" className="h-10" />

      <div className="flex items-center justify-between gap-3 md:gap-7">
        <div className="inline-flex items-center gap-1.5">
          <div className="text-xl font-medium">{getFormattedDateTime().time}</div>
          <span className="text-title-sm font-bold opacity-75">​•​</span>
          <div className="text-xl font-medium">{getFormattedDateTime().date}</div>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="size-10 ring-2 rounded-full cursor-pointer hover:shadow-theme-xl dropdown-toggle"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />

          <Dropdown className="w-60 " isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
            <DropdownItem
              onClick={() => {
                console.log("Logout clicked");
              }}
              className="text-red-600"
            >
              Sign out
            </DropdownItem>

            <DropdownItem
              tag="a"
              to={'/signin'}
              onClick={() => {
                console.log("Logout clicked");
              }}
              className="text-blue-600"
            >
              Sign in
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
