import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react';
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from 'next/image';
 
function Header() {
  return (
    <header style={{ position: "absolute", display: "flex", justifyContent: "space-between", padding: 10, width: '100%' }}>
      <div className='logoBox'>
        <Image src="/logo.png" alt="InterviewGPT logo" width="200" height="75" />
      </div>
      <div className="flex space-x-4 justify-center items-center">
        <SignedIn>
          <UserButton appearance={{baseTheme: dark}} afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-blue-300 border border-blue-500 hover:text-white hover:bg-[#2d06ff4a] py-2 px-4 rounded-3xl transition duration-300 ease-in-out">Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-white py-2 px-4 rounded-3xl transition duration-300 ease-in-out">Sign up</button>
          </SignUpButton>
        </SignedOut>
      </div>
    </header>
  );
}

export const metadata: Metadata = {
  title: 'PDF Chat',
  description: 'Chat with your PDFs using AI! - A Codebender Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark
      }}
    >
      <html lang="en">
        <body>
          <Header />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}