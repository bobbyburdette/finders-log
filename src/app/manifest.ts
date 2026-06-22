import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Finder's Log",
    short_name: "Finder's Log",
    description: "A private journal for pipes, cigars, and spirits.",
    start_url: "/",
    display: "standalone",
    background_color: "#080704",
    theme_color: "#080704"
  };
}
