import db from '@/prisma/db';

export async function POST(req: Request) {
  const { mac_address } = await req.json();
  try {
    await db.device.create({
      data: {
        mac_address,
      },
    });
  } catch (error) {
    console.log('[Device.Create] error: ', error);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 201 });
}
