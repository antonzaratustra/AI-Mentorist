import "./globals.css";

export const metadata = {
  title: "Mentorist Prototype",
  description:
    "Interactive Next.js prototype of the Mentorist life strategy service.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
