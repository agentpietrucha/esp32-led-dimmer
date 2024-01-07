import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string;
};

export function GET(req: NextApiRequest) {
  console.log('[API] hello');
  // res.status(200).json({ message: 'Halko centralko' });
  return Response.json({ message: 'dupa' });
}
