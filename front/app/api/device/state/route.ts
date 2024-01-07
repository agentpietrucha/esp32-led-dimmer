import mqttClient from '@/mqtt/mqtt';
import db from '@/prisma/db';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types';
import { MqttClient } from 'mqtt';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

const sub = (mqttClient: MqttClient, macAddress: string) =>
  new Promise<string | undefined>((resolve, reject) => {
    const subTopic = `status/${macAddress}`;
    mqttClient.subscribe(subTopic);
    let noResponse = true;
    mqttClient.on('message', (topic, message) => {
      noResponse = false;
      mqttClient.unsubscribe(subTopic);
      resolve(message.toString());
    });
    setTimeout(() => {
      if (noResponse) {
        mqttClient.unsubscribe(subTopic);
        reject();
      }
    }, 5000);
  });

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get('email');

  console.log('email', email);

  if (!email) return new Response(null, { status: 400 });

  const user = await db.user.findFirst({
    where: {
      email: email,
    },
    select: {
      devices: true,
    },
  });
  const devices = user && user.devices;

  if (devices && devices.length) {
    const device = devices[0];

    const mqtt = await mqttClient();
    if (!mqtt) return new Response(null, { status: 500 });
    mqtt.publish(`get_status/${device.mac_address}`, '');

    const result = await sub(mqtt, device.mac_address);
    if (!result) return new Response(null, { status: 500 });
    return new Response(result, { status: 200 });
  }

  return new Response('No devices are assigned to account', { status: 401 });
}
