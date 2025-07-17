import SignupPage from "./SignupPage";


export default function SignUpDashboard() {
  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-white">
      {/* Left Panel */}
      <div className="hidden md:block md:w-[35%] h-full bg-[#d0dcfa] rounded-r-[2rem]" />

      {/* Right Panel */}
      <SignupPage />
      
      {/* Merged Center Image */}
      <div className="hidden md:flex absolute left-15 top-1/2 -translate-y-1/2 z-10 bg-[#d0dcfa] p-4 rounded-xl shadow">
        <img
          src="/sigin.png"
          alt="Sign in"
          className="w-[340px] lg:w-[480px] h-auto rounded-xl object-cover"
        />
      </div>
    </div>
  );
}
