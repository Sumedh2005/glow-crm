import "./globals.css"

export const metadata = {
  title: "Glow CRM",
  description: "AI-Native CRM for D2C Skincare Brands",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}