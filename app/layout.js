import "./globals.css";

export const metadata = {
  title: "ETF.PLAN — Build Wealth One Month at a Time",
  description: "A smart ETF investment plan from $50/month. Real data, real projections.",
  verification: {
    google: "KG7a0kWH83vNJCwa590sgdPc4WlV5TBwUppzGVPF5fw",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
