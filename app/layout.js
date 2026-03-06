import "./globals.css";

export const metadata = {
  title: "Mentorist",
  description: "Связный кабинет личной стратегии, целей, наставничества и групповой поддержки.",
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
