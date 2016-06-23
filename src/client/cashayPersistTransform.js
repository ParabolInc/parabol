import {createTransform} from 'redux-persist';
import jwtDecode from 'jwt-decode';

const cashayDeserializer = outboundState => {
  const auth = outboundState.data.result.getUserWithAuthToken;
  if (auth) {
    const authObj = auth[''];
    const {authToken} = authObj;
    if (authToken) {
      const authTokenObj = jwtDecode(authToken);
      if (authTokenObj.exp < Date.now() / 1000) {
        authObj.authToken = null;
      }
    }
  }
  return outboundState;
};

export default createTransform(
  state => state,
  cashayDeserializer,
  {whitelist: ['cashay']}
);

