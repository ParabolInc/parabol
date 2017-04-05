import github from 'universal/styles/theme/images/graphics/GitHub-Mark-120px-plus.png';

export default [
  {
    logo: github,
    name: 'GitHub',
    openOauth: (teamMemberId) => (e) => {
      const uri = `https://github.com/login/oauth/authorize?scope=user:email,repo,write:repo_hook&state=${teamMemberId}&client_id=${__GITHUB_CLIENT_ID__}`;
      window.open(uri);
    },
    service: 'github'
  }
]
