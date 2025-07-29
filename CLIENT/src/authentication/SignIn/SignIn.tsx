import SignInDashboard from "./SignInDashboard";
import AuthNavbar from "../authNavbar";


const SignIn = () => {
  return (
    <div className="absolute w-full h-screen overflow-hidden">
      <div className="relative top-0">
        <AuthNavbar />
      </div>
      <div className="h-full">
        <SignInDashboard />
      </div>
    </div>
  );
};

export default  SignIn;
