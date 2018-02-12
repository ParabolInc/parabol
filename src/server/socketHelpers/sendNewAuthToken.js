import {GQL_DATA, NEW_AUTH_TOKEN} from 'universal/utils/constants';
import encodeAuthTokenObj from 'server/utils/encodeAuthTokenObj';
import sendMessage from 'server/socketHelpers/sendMessage';

const sendNewAuthToken = (socket, authTokenObj) => {
  sendMessage(socket, GQL_DATA, {authToken: encodeAuthTokenObj(authTokenObj)}, NEW_AUTH_TOKEN);
};

export default sendNewAuthToken;
