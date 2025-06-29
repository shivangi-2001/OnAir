import LanguageSelector from "../common/LanguageSelect";


export default function SignInNavbar(){
    return (
        <nav className="p-3 md:px-10 h-16 bg-white shadow-sm border-b-2 border-gray-100 flex justify-between">
        {/* logo */}
        <img src="logo.png" alt="onAir" className="h-10" />
        <div className="flex justify-between align-middle items-center gap-1 md:gap-7">
          {/* Navbar List */}
          <div className="link block md:hidden">
            <a href="">Sign up free</a>
          </div>
          <div className="link hidden md:block">
            New to onAir? <a href="">Sign up free</a>
          </div>
          <div className="link hidden md:block">
            <a href="#">Support</a>
          </div>
          <LanguageSelector />
        </div>
      </nav>
    )
}