import crypto from 'crypto';
import schema from 'server/graphql/rootSchema';

// TODO when this is all legit, we'll map through the queries & use the ASTs instead of the strings
const eventLookup = {
  organization: {
    member_added: {
      getVars: ({invitation: {login: userName}, organization: {login: orgName}}) => ({userName, orgName}),
      query: `
        mutation GitHubAddMember($userName: ID! $orgName: ID!) {
          githubAddMember(userName: $userName, orgName: $orgName)
        }
      `
    },
    member_removed: {
      getVars: ({membership: {user: {login: userName}}, organization: {login: orgName}}) => ({userName, orgName}),
      query: `
        mutation GitHubRemoveMember($userName: ID! $orgName: ID!) {
          githubRemoveMember(userName: $userName, orgName: $orgName)
        }
      `
    }
  }
};

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
  console.log('got event', event, hash === myHash);
  if (hash !== myHash) return;
  const {getVars, query} = eventLookup[event][body.action];
  const variables = getVars(body);
  const context = {serverSecret: process.env.AUTH0_CLIENT_SECRET};
  graphql(schema, query, {}, context, variables);
};
