import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page renders in the browser and fetches from the PetBuddy API;
  // nothing here runs server-side on the user's behalf.
  poweredByHeader: false,
  // Don't write agent instruction files into the project on `next dev`.
  agentRules: false,
};

export default nextConfig;
