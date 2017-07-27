const makeGitHubPostOptions = (accessToken, body) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}

export default makeGitHubPostOptions;