import { Victor_Mono } from 'next/font/google'
import './globals.css'

const inter = Victor_Mono({ subsets: ['latin'] })

export const metadata = {
  title: 'MP3Ninja',
  description: 'Download mp3 from youtube easily',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
