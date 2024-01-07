import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { Button } from '@/components/ui/button';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LEESP32',
  description: 'IoT Controller',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = getKindeServerSession();
  const isAuth = await isAuthenticated();
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-zinc-700 flex justify-between p-3 shadow-2xl">
          <h1 className="font-bold text-2xl text-white self-center">LEESP32</h1>
          <div className="flex gap-2">
            {isAuth ? (
              <LogoutLink>
                <Button>Logout</Button>
              </LogoutLink>
            ) : (
              <>
                <LoginLink>
                  <Button variant={'secondary'}>Login</Button>
                </LoginLink>
                <RegisterLink>
                  <Button>Register</Button>
                </RegisterLink>
              </>
            )}
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
