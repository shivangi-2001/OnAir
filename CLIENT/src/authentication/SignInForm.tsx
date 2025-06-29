import Button from "../ui/button/Button";
import { AppleIcon, GoogleIcon, MicrosoftIcon, TwitterIcon } from "../icons";

const signInOption = [
  { name: "apple", icon: AppleIcon },
  { name: "google", icon: GoogleIcon },
  { name: "twitter", icon: TwitterIcon },
  { name: "microsoft", icon: MicrosoftIcon },
];

export default function SignInPage() {
  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-white">
      {/* Left Panel */}
      <div className="hidden md:block md:w-[35%] h-full bg-[#d0dcfa] rounded-r-[2rem]" />

      {/* Right Panel */}
      <div className="w-full md:w-[65%] flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center text-center w-[90%] md:w-[50%] gap-4 mt-8 mb-4">
          <h1 className="text-[30px] font-semibold text-gray-900 mb-5">
            Sign in
          </h1>

          <input
            type="email"
            placeholder="Email or phone number"
            className="w-full px-4 h-10 border border-gray-300 rounded-lg focus:outline-2 focus:outline-[#4f46e5] focus:outline-offset-2 placeholder:opacity-70 text-sm"
          />

          <Button  variant="primary">Next</Button>


          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">Or sign in with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex flex-row justify-center gap-6 flex-wrap">
            {signInOption.map((icons) => (
              <div
                key={icons.name}
                className="grid grid-flow-row items-center justify-center text-center"
              >
                <button className="p-4 border border-gray-200 rounded-md hover:shadow-md transition hover:scale-105 bg-white">
                  <img src={icons.icon} alt={icons.name} className="w-5 h-5" />
                </button>
                <p className="text-gray-600 text-sm font-medium capitalize mt-2">
                  {icons.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <br />

        {/* Footer */}
        <div className="w-full flex flex-col items-center text-center text-sm text-gray-500 px-4 pb-4">
          {/* Links */}
          <div className="flex flex-row gap-4 justify-center mb-2">
            <li className="link"><a href="#" className="hover:underline text-gray-500"> Help </a></li>
            <li className="link"><a href="#" className="hover:underline text-gray-500"> Terms </a></li>
            <li className="link"><a href="#" className="hover:underline text-gray-500"> Privacy </a></li>
          </div>

          {/* reCAPTCHA Notice */}
          <p className="max-w-[320px] text-center text-sm text-gray-500 leading-relaxed">
            OnAir is protected by reCAPTCHA and the{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </div>
      </div>

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
