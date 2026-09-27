import "./globals.css";

export const metadata = {
  title: "Mariam Academy",
  description: "منصة مريم التعليمية"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
