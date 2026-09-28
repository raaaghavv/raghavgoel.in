"use client";

import dynamic from "next/dynamic";

/** Client-only boundary: the ride needs window, WebGL and canvas, so it never renders on the server. */
const RideLayer = dynamic(() => import("./RideLayer"), { ssr: false });

export default function Ride() {
  return <RideLayer />;
}
