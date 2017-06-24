import queryIntegrator from '../utils/queryIntegrator';
import {handleRethinkRemove} from '../utils/makeChangefeedHandler';
import shortid from 'shortid';

const handleIntegration = async (accessToken, exchange, service, teamMemberId) => {
  const [userId] = teamMemberId.split('::');
  const channel = `providers/${teamMemberId}`;
  const id = shortid.generate();
  //console.log('handling integration', accessToken, service, teamMemberId);
  const {data} = await queryIntegrator({
    action: 'addProvider',
    payload: {
      id,
      accessToken,
      service,
      teamMemberId
    }
  });
  const oldToken = data && data.setToken;
  if (oldToken) {
    const clientDoc = handleRethinkRemove({id: oldToken});
    exchange.publish(channel, clientDoc);
  }
  // tell the subs that something new has arrived
  exchange.publish(channel, {
    type: 'add',
    fields: {
      id,
      accessToken,
      service,
      userId
    }
  });
};

export default handleIntegration;
