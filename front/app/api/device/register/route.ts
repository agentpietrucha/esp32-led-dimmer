import db from '@/prisma/db';

const getAccessToken = async () => {
  return fetch(`https://karolek.kinde.com/oauth2/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      audience: 'https://karolek.kinde.com/api',
      client_id: '4da2d2ba303d46ed97d4bdaa0ba7affc',
      client_secret: 'n6oO0slzSN5EAxDZYmMDeuS3TlzFsRpAAUUJEZhVnp9pgQvzPPjm',
    }),
  })
    .then((token) => token.json())
    .then((data) => data.access_token);
};

const getUser = async (email: string) => {
  const token = await getAccessToken();
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  return fetch(`https://karolek.kinde.com/api/v1/users?email=${email}`, {
    method: 'GET',
    headers: headers,
  }).then((res) => res.json());
};

export async function POST(req: Request) {
  const { mac_address, email } = await req.json();
  console.log('[POST DEVICE/REGISTER] mac_address', mac_address);
  console.log('[POST DEVICE/REGISTER] email', email);
  const { users } = await getUser(email);
  console.log('[POST DEVICE/REGISTER] users', users);
  if (!users) return new Response('Non existing user', { status: 401 });

  try {
    const user = await db.user.upsert({
      create: {
        name: users[0].full_name,
        email,
      },
      update: {
        name: users[0].full_name,
      },
      where: {
        email,
      },
    });

    await db.device.update({
      data: {
        userId: user.id,
      },
      where: {
        mac_address,
      },
    });
  } catch (error) {
    console.log('[Device.register] error: ', error);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 201 });
}
