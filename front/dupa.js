fetch(`https://karolek.kinde.com/oauth2/token`, {
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
  .then((token) => console.log('token', token));
