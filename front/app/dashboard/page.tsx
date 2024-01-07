import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LEDControls } from '@/components/ui/ledControls';
import { Slider } from '@/components/ui/slider';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getUser();
  const isAuthed = await isAuthenticated();
  const status = {};

  if (!isAuthed) redirect('/');

  return (
    <main className="flex flex-col gap-20 mt-5">
      <h1 className="text-3xl font-bold text-center">
        Welcome {user?.given_name}!
      </h1>
      <LEDControls />
    </main>
  );
}
