import githubLogo from 'universal/styles/theme/images/graphics/GitHub-Mark-120px-plus.png';
import slackLogo from 'universal/styles/theme/images/graphics/Slack_Mark.svg';
import {cashay} from 'cashay';
import makeHref from "../../../utils/makeHref";

export default [
  {
    logo: github,
    name: 'GitHub',
    openOauth: (teamMemberId) => (e) => {
      const uri = `https://github.com/login/oauth/authorize?scope=user:email,repo,write:repo_hook&state=${teamMemberId}&client_id=${__GITHUB_CLIENT_ID__}`;
      window.open(uri);
    },
    removeOauth: (teamMemberId) => () => {
      cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'github'}})
    },
    service: 'github',
    dropdownMapper: (accessToken, lastUpdated) => (e) => {
      const now = new Date();
      if (now - lastUpdated > ms('3s')) {
        lastUpdated = now;
        const uri = `https://api.github.com/user/repos`;
        fetch(uri, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${accessToken}`
          }
        }).then((res) => res.json())
          .then((res) => {
            this.setState({
              options: res.map((repo) => ({id: repo.full_name, label: repo.full_name}))
            });
          }).catch((e) => {
          console.log(e)
        })
      }
    },
    dropdownText: 'Sync a project',
    itemClick: (accessToken, obj) => async () => {
      const issues = await ghFetch(`/repos/${repo.id}/issues`, accessToken);
      console.log('issues', issues);
    }
  },
  {
    logo: slack,
    name: 'Slack',
    openOauth: (teamMemberId) => (e) => {
      const redirect = makeHref('/auth/slack');
      const uri = `https://slack.com/oauth/authorize?client_id=${__SLACK_CLIENT_ID__}&scope=chat:write:bot&state=${teamMemberId}&redirect_uri=${redirect}`;
      window.open(uri);
    },
    removeOauth: (teamMemberId) => () => {
      cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'slack'}})
    },
    service: 'slack'
  }
]
