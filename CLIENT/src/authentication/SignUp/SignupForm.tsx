import { useState } from "react";
import Button from "../../ui/button/Button";
import { useAuth } from "../../context/authContext";

const SignupForm = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfilePicture(file);
    if (file) console.log("Selected file:", file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (profilePicture) {
      formData.append("profile", profilePicture); 
    }

    console.log(formData)

    try {
      await register(formData);
      window.location.href = "/signin";
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center gap-4 w-full"
    >
      <h1 className="text-[30px] font-semibold text-gray-900 mb-2 text-center">
        Sign up
      </h1>
      {errorMessage && (
        <p className="text-red-600 text-sm text-center">{errorMessage}</p>
      )}

      <input
        type="text"
        placeholder="Full Name"
        name="name"
        value={name}
        onChange={handleInputChange}
        autoComplete="name"
        required
        className="w-full px-4 h-10 border border-gray-300 rounded-lg text-sm"
      />

      <input
        type="email"
        placeholder="Email"
        name="email"
        value={email}
        onChange={handleInputChange}
        autoComplete="email"
        required
        className="w-full px-4 h-10 border border-gray-300 rounded-lg text-sm"
      />

      <input
        type="password"
        placeholder="* * * * * * *"
        name="password"
        value={password}
        onChange={handleInputChange}
        autoComplete="new-password"
        required
        className="w-full px-4 h-10 border border-gray-300 rounded-lg text-sm"
      />

      <input
        type="file"
        name="profilePicture"
        onChange={handleFileChange}
        accept="image/*"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
      />

      <Button
        type="submit" // ✅ FIXED
        className="w-full shadow hover:scale-105"
        variant="primary"
      >
        {isLoading ? "Creating account..." : "Register"}
      </Button>
    </form>
  );
};

export default SignupForm;
