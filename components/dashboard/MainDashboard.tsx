"use client";

import OtpModal from "./OtpModal";
import { ConnectCalendarButton } from "./ConnectCalendarButton";
import { MetricsCards } from "./MetricsCards";

export function MainDashboard() {
  return (
    <>
      <OtpModal />
      {/* Existing dashboard content goes here */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Bienvenido</h2>
        <ConnectCalendarButton authConfigId={process.env.NEXT_PUBLIC_COMPOSIO_AUTH_CONFIG_ID!} />
        {/* Placeholder metrics until implemented */}
      </div>
      <MetricsCards />
    </>
  );
}
