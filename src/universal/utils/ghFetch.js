const prefix = 'https://api.github.com';

const ghFetch = async (endpoint, accessToken) => {
  const uri = `${prefix}${endpoint}`;
  try {
    const res = await fetch(uri, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${accessToken}`
      }
    });
    return res.json();
  } catch (e) {
    // TODO pop a toast saying limit hit or whatever
    throw new Error(e);
  }
};

export default ghFetch;
