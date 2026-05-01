import "./globals.css";

export const metadata = {
  title: "Sapna Munoth × Vouch Demo",
  description:
    "A premium buyer-intent and Instagram DM filtering demo for Sapna Munoth.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}