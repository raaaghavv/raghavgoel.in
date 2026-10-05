import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Stack from "@/components/sections/Stack";
import Experience from "@/components/sections/Experience";
import Certificates from "@/components/sections/Certificates";
import Finish from "@/components/sections/Finish";
import RideLayer from "@/features/ride/RideLayer";

/** Everything here is server-rendered from src/config; the ride layer hydrates on top. */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Experience />
        <Projects />
        <Stack />
        <Certificates />
        <Finish />
      </main>
      <RideLayer />
    </>
  );
}
