import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import db from '@/prisma/db';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function updateDevice(value: number, user: KindeUser) {
  return fetch('/api/device/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value, email: user.email }),
  });
}

export async function getDeviceState(user: KindeUser) {
  return fetch(`/api/device/state/?email=${user.email}`);

  // 'use server';
  // const user = db.user.findFirst({
  //   where: {
  //     email: kUser.email!,
  //   },
  // });
  // const devices = await user.devices();
  // if (devices && devices.length) {
  //   const device = devices[0];
  //   return fetch(`/api/device/state/?device=${device.mac_address}`);
  // }
  // return new Response('No devices are assigned to account', { status: 401 });
}
