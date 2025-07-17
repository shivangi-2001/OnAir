import OAuth from "../OAuth";
import SignupForm from "./SignupForm";

const SignupPage = () => {

    return (
        <div className="w-full md:w-[65%] flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center text-center w-[90%] md:w-[50%] gap-4 mt-8 mb-4">

            <SignupForm />

            {/* Divider */}
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-sm">Or sign up with</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Social Login */}
            <div className="flex flex-row justify-center gap-6 flex-wrap">
                <OAuth />
            </div>
        </div>

        <br />

        {/* Footer */}
        <div className="w-full flex flex-col items-center text-center text-sm text-gray-500 px-4 pb-4">
            {/* Links */}
            <div className="flex flex-row gap-4 justify-center mb-2">
            <li className="link">
                <a href="#" className="hover:underline text-gray-500">
                {" "}
                Help{" "}
                </a>
            </li>
            <li className="link">
                <a href="#" className="hover:underline text-gray-500">
                {" "}
                Terms{" "}
                </a>
            </li>
            <li className="link">
                <a href="#" className="hover:underline text-gray-500">
                {" "}
                Privacy{" "}
                </a>
            </li>
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
    );
};

export default SignupPage;
