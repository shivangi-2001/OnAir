import { useLocation, Link } from "react-router-dom";
import LanguageSelector from "../common/LanguageSelect";

export default function AuthNavbar() {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <nav className="p-3 md:px-10 h-16 bg-white shadow-sm border-b-2 border-gray-100 flex justify-between">
      <img src="logo.png" alt="onAir" className="h-10" />
      <div className="flex justify-between items-center gap-1 md:gap-7">
        {isSignup ? (
          <>
            <div className="link block md:hidden">
              <Link to="/signin">Login</Link>
            </div>
            <div className="link hidden md:block">
              Already have an account? <Link to="/signin">Login</Link>
            </div>
          </>
        ) : (
          <>
            <div className="link block md:hidden">
              <Link to="/signup">Sign up free</Link>
            </div>
            <div className="link hidden md:block">
              New to onAir? <Link to="/signup">Sign up free</Link>
            </div>
          </>
        )}
        <div className="link hidden md:block">
          <a href="#">Support</a>
        </div>
        <LanguageSelector />
      </div>
    </nav>
  );
}
