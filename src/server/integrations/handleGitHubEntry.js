import request from 'request';

const handleGitHubEntry = (req, res) => {
  const {query} = req;
  const delimiterIdx = query.state.indexOf('::');
  const origin = query.state.substring(0, delimiterIdx);
  const publicOrigin = origin.indexOf('localhost') !== -1 ? 'http://dev.parabol.ultrahook.com' : origin;
  const qs = {
    ...query,
    state: query.state.substring(delimiterIdx + 2)
  };
  const newUrl = `${publicOrigin}/auth/github`;
  req.pipe(request({qs, uri: newUrl})).pipe(res);
};

export default handleGitHubEntry;
