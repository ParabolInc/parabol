import makeAppLink from 'server/utils/makeAppLink';

const makeGitHubWebhookParams = (events) => ({
  name: 'web',
  config: {
    url: makeAppLink('webhooks/github', {isWebhook: true}),
    content_type: 'json',
    // this doesn't have to be the client secret, but i don't see much harm in reusing it, assuming it's all SSL
    secret: process.env.GITHUB_WEBHOOK_SECRET,
    insecure_ssl: 0
  },
  events,
  active: true
});

export default makeGitHubWebhookParams;
