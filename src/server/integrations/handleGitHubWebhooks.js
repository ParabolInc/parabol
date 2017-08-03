import crypto from 'crypto';
import memberAdded from 'server/integrations/githubWebhookHandlers/memberAdded';

export default async (req, res) => {
  res.sendStatus(200);
  const event = req.get('X-GitHub-Event');
  const hexDigest = req.get('X-Hub-Signature');
  const [shaType, hash] = hexDigest.split('=');
  const {body} = req;
  const myHash = crypto
    .createHmac(shaType, process.env.GITHUB_CLIENT_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  if (hash !== myHash) return;
  if (event === 'member_added') {
    memberAdded(body);
  }
};
