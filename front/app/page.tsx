import Image from 'next/image';
import {
  RegisterLink,
  LoginLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center main-gradient">
      <Card className="bg-gray-900 text-white shadow-xl text-center max-w-[90%] w-[512px] py-10">
        <div className="mx-auto flex flex-col gap-8 ">
          <h1 className="text-4xl sm:text-md to-gray-900 font-bold">
            LED Controller
          </h1>
          <p className="">Online remote to control your LED lights</p>
          <div className="flex flex-col">
            <RegisterLink>
              <Button variant={'secondary'} size={'lg'}>
                <span className="font-bold">Register now!</span>
              </Button>
            </RegisterLink>
            <LoginLink>
              <Button variant={'link'} size={'sm'}>
                <span className="text-white">Login</span>
              </Button>
            </LoginLink>
          </div>
        </div>
      </Card>
    </main>
  );
}
