"use client";

import PlausibleProvider from "next-plausible";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlausibleProvider
      domain="recommand.eu"
      trackOutboundLinks={true}
      trackFileDownloads={true}
    >
      {children}
    </PlausibleProvider>
  );
}
