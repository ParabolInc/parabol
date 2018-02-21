import {sign} from 'jsonwebtoken';
import {clientSecret} from './auth0Helpers';

const encodeAuthTokenObj = (authTokenObj) => {
  const secret = new Buffer(clientSecret, 'base64');
  return sign(authTokenObj, secret);
};

export default encodeAuthTokenObj;
