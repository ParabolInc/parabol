import {GITHUB_ENDPOINT} from 'universal/utils/constants';

const getRepoQuery = `
query getRepo($name: String! $owner: String!) {
  repository(name: $name, owner: $owner) {
    nameWithOwner
  }
}`;

const tokenCanAccessRepo = async (accessToken, nameWithOwner) => {
  const [owner, name] = nameWithOwner.split('/');
  // see if the githubRepoId is legit
  const authedPostOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      query: getRepoQuery,
      variables: {name, owner}
    })
  };
  const ghProfile = await fetch(GITHUB_ENDPOINT, authedPostOptions);
  return ghProfile.json();
};

export default tokenCanAccessRepo;