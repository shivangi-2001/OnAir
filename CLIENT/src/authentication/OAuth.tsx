import {
  facebookIcon,
  GithubIcon,
  GoogleIcon,
  linkedinIcon,
  MicrosoftIcon,
  TwitterIcon,
} from "../icons";

const signInOption = [
  {
    name: "github",
    icon: GithubIcon,
    href: "http://localhost:8000/api/auth/github",
  },
  {
    name: "google",
    icon: GoogleIcon,
    href: "http://localhost:8000/api/auth/google",
  },
  {
    name: "facebook",
    icon: facebookIcon,
    href: "http://localhost:8000/api/auth/facebook",
  },
  {
    name: "twitter",
    icon: TwitterIcon,
    href: "http://localhost:8000/api/auth/x",
  },
  {
    name: "linkedin",
    icon: linkedinIcon,
    href: "http://localhost:8000/api/auth/linkedin",
  },
  {
    name: "microsoft",
    icon: MicrosoftIcon,
    href: "http://localhost:8000/api/auth/microsoft",
  },
];

const OAuth = () => {
  return (
    <>
      {signInOption.map((icons: any) => (
        <a
          href={icons.href || "#"}
          target="_top"
          key={icons.name}
          className="grid grid-flow-row items-center justify-center text-center"
        >
          <button className="inline-flex justify-center border-gray-200 rounded-md transition hover:scale-115 bg-white">
            <img src={icons.icon} alt={icons.name} className="w-10" />
          </button>
          <p className="text-gray-600 text-sm font-medium capitalize mt-2">
            {icons.name}
          </p>
        </a>
      ))}
    </>
  );
};

export default OAuth;
