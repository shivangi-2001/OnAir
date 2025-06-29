import SignInPage from "./SignInForm";
import SignInNavbar from "./SignInNavbar";


const SignIn = () => {
  return (
    <div className="absolute w-full h-screen overflow-hidden">
      <div className="relative top-0">
        <SignInNavbar />
      </div>
      <div className="h-full">
        <SignInPage />
      </div>
    </div>
  );
};

export default SignIn;
