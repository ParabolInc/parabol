import {createTransform} from 'redux-persist';
import jwtDecode from 'jwt-decode';

const cashayDeserializer = authToken => {
  if (authToken) {
    const authTokenObj = jwtDecode(authToken);
    if (authTokenObj.exp < Date.now() / 1000) {
      authToken = '';
    }
  }
  return authToken;
};

export default createTransform(
  state => state,
  cashayDeserializer,
  {whitelist: ['authToken']}
);

