import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Stack from "@/components/sections/Stack";
import Experience from "@/components/sections/Experience";
import Certificates from "@/components/sections/Certificates";
import Finish from "@/components/sections/Finish";
import Ride from "@/features/ride/Ride";

/** Everything here is server-rendered from src/config; the ride layer hydrates on top. */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Projects />
        <Stack />
        <Experience />
        <Certificates />
        <Finish />
      </main>
      <Ride />
    </>
  );
}
