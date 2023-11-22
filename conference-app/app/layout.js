import { Inter } from 'next/font/google'
import './globals.css'
import SocketProvider from './context/SocketProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
 
  return (
    <html lang="en">
      <body  className={inter.className}>
        <SocketProvider>
        <div className='min-h-screen w-screen bg-gradient-to-b from-blue-400 via-purple-500 to-red-400 flex '>
        {children}
        </div>
        </SocketProvider>
        </body>
    </html>
  )
}