import "./globals.css";

export const metadata = {
  title: "SIP Sprout — Mutual Fund Growth Calculator",
  description:
    "Plan your monthly SIP investment, see it grow year on year, and compare it against real market benchmarks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
