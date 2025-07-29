import { useState } from "react";
import Button from "../../ui/button/Button";
import { useAuth } from "../../context/authContext";

const LoginForm = () => {
  const { login } = useAuth(); 

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {

      await login(email, password);
      window.location.href = "/"; 
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center gap-4 w-full"
    >
      <h1 className="text-[30px] font-semibold text-gray-900 mb-2 text-center">
        Sign in
      </h1>

      {errorMessage && (
        <p className="text-red-600 text-sm text-center">{errorMessage}</p>
      )}

      <input
        type="email"
        placeholder="Email or phone number"
        name="email"
        value={email}
        onChange={handleInputChange}
        autoComplete="email"
        required
        className="w-full px-4 h-10 border border-gray-300 rounded-lg focus:outline-2 focus:outline-[#4f46e5] focus:outline-offset-2 placeholder:opacity-70 text-sm"
      />

      <input
        type="password"
        placeholder="* * * * * * *"
        name="password"
        value={password}
        onChange={handleInputChange}
        autoComplete="current-password"
        required
        className="w-full px-4 h-10 border border-gray-300 rounded-lg focus:outline-2 focus:outline-[#4f46e5] focus:outline-offset-2 placeholder:opacity-70 text-sm"
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full shadow hover:scale-105"
        variant="primary"
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;
