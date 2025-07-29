import Navbar from "../navbar";
import { motion } from "framer-motion";
import Carousel from "./carousel";
import LeftPanel from "./LeftPanel";
import { Layout } from "../Layout/Layout";

const images = [
  {
    src: "./image2.png",
    heading: "Get a link you can share",
    content:
      "Click <b>New meeting</b> to get a link you can send to people you want to meet with",
  },
  {
    src: "./image1.png",
    heading: "Your meeting is safe",
    content: "No one can join a meeting unless invited or admitted by the host",
  },
  {
    src: "./image3.png",
    heading: "Plan ahead",
    content:
      "Click <b>New meeting</b> to schedule meetings in Google Calendar and send invites to participants",
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="relative w-full h-screen bg-brand-50/50 overflow-hidden">
      {/* Navbar (absolute at top) */}
      <div className="absolute top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      {/* Grid section below navbar */}
      <div className="absolute top-[12px] bottom-0 left-0 right-0 flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full h-full">
          {/* Left Side */}
          <div className="flex items-center justify-start p-6">
            <motion.div
              initial={{ opacity: 0.7, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1.0 }}
              transition={{ duration: 0.4 }}
            >
              <LeftPanel />
            </motion.div>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center bg-white">
            <Carousel images={images} options={{ loop: true }} />
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Index;
