import mqttClient from '@/mqtt/mqtt';
import db from '@/prisma/db';

export async function POST(req: Request) {
  const body = await req.json();
  if (!body) return new Response(null, { status: 401 });

  const { value, email } = body;

  const user = await db.user.findFirst({
    where: {
      email,
    },
    select: { devices: true },
  });

  console.log('user', user);

  const devices = user?.devices;

  if (devices && devices.length) {
    const device = devices[0];
    const mqtt = await mqttClient();
    if (!mqtt) return new Response(null, { status: 500 });
    mqtt.publish(`dim/${device.mac_address}`, String(value));
    return new Response(null, { status: 200 });
  }

  return new Response('No device assigned', { status: 401 });
}
