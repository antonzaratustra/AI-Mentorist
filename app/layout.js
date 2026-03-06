import "./globals.css";

export const metadata = {
  title: "Mentorist Prototype",
  description:
    "Interactive Next.js prototype of the Mentorist life strategy service.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
