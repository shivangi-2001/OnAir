import AuthNavbar from "../authNavbar";
import SignUpDashboard from "./SignUpDashboard";


const SignUp = () => {
  return (
    <div className="absolute w-full h-screen overflow-hidden">
      <div className="relative top-0">
        <AuthNavbar />
      </div>
      <div className="h-full">
        <SignUpDashboard />
      </div>
    </div>
  );
};

export default  SignUp;
