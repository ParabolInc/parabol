export default async (req, res) => {
  const event = req.get('X-GitHub-Event');
  const hexDigest = req.get('X-Hub-Signature');
  console.log('hexDigest', hexDigest);
  console.log('event', event);

  const {body} = req;
  console.log('got body', body);
};
