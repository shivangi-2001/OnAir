import { useState } from "react";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { DropdownItem } from "./ui/dropdown/DropdownItem";
import { useAuth } from "./context/authContext";
import LanguageSelector from "./common/LanguageSelect";
import { Link } from "react-router";

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
  const { logout, user } = useAuth();

  const isAuthenticated = !!user;


  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect to signin page here
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="relative p-3 md:px-10 h-16 shadow-theme-md border-b-2 bg-brand-200 border-brand-400 flex justify-between">
      <Link to="/"><img src="logo.png" alt="onAir" className="h-10" /></Link>

      <div className="flex items-center justify-between gap-3 md:gap-7">
        <div className="inline-flex items-center gap-1.5">
          <div className="text-xl font-medium">{getFormattedDateTime().time}</div>
          <span className="text-title-sm font-bold opacity-75">•</span>
          <div className="text-xl font-medium">{getFormattedDateTime().date}</div>
        </div>

        <LanguageSelector />


        {/* Profile Section */}
        {user?.email && (
          <div className="relative">
            <img
              src={user?.profile || "https://images.unsplash.com/photo-1619417612216-2b8afd7e86e4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMHx8fGVufDB8fHx8fA%3D%3D"}
              alt="Profile"
              className="size-10 ring-1 rounded-full cursor-pointer hover:shadow-theme-xl"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />

            <Dropdown
              className="w-60"
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
            >
              {isAuthenticated ? (
                <DropdownItem
                  tag="button"
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  Sign out
                </DropdownItem>
              ) : (
                <DropdownItem
                  tag="a"
                  to="/signin"
                  className="text-blue-600"
                >
                  Sign in
                </DropdownItem>
              )}
            </Dropdown>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
