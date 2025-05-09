import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Global Tax Calculator',
  description: 'Calculate your taxes across different countries and get AI-powered tax saving suggestions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
