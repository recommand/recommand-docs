import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions, chromeClassName } from "@/lib/layout.shared";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()} className={chromeClassName}>
      {children}
    </HomeLayout>
  );
}
