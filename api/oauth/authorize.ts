export default async function handler(req: any, res: any) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:3000';
  
  const reqUrl = new URL(req.url, `${proto}://${host}`);
  const redirectTarget = `${proto}://${host}/oauth/authorize${reqUrl.search}`;

  res.writeHead(302, { Location: redirectTarget });
  res.end();
}
