import { motion } from "@/config/motion";
import { checkpoints } from "@/config/sections";

/**
 * Inline <head> script that runs before first paint. It hides the hero name (html[data-intro-wait]) so the
 * name doesn't show, vanish and roll back in once the engine arrives. Skipped when there is no intro
 * (reduced motion, or a deep link to a checkpoint). After motion.intro.waitFor it gives up and shows the
 * name (html[data-intro-late]); an engine that arrives later skips the intro.
 */
export function rideBootScript(): string {
  const deepLinks = JSON.stringify(checkpoints.slice(1).map((c) => c.id));
  return `(function(d){try{
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(${deepLinks}.indexOf(decodeURIComponent(location.hash.slice(1)))>-1)return;
d.dataset.introWait="";
setTimeout(function(){if("introWait" in d.dataset){delete d.dataset.introWait;d.dataset.introLate=""}},${motion.intro.waitFor});
}catch(e){}})(document.documentElement)`;
}
