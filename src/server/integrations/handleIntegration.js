import queryIntegrator from '../utils/queryIntegrator';
import {handleRethinkRemove} from '../utils/makeChangefeedHandler';
import shortid from 'shortid';
import {errorObj} from 'server/utils/utils';

const handleIntegration = async (accessToken, exchange, service, teamMemberId) => {
  const [userId, teamId] = teamMemberId.split('::');
  const channel = `providers/${teamMemberId}`;
  const id = shortid.generate();
  //console.log('handling integration', accessToken, service, teamMemberId);
  const {data, errors} = await queryIntegrator({
    action: 'addProvider',
    payload: {
      id,
      accessToken,
      service,
      teamMemberId
    }
  });

  if (errors) {
    const error = errorObj({_error: errors[0]});
    // TODO design how to send error down the pipe
    //exchange.publish(channel, )
    return;
  }

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
      teamIds: [teamId],
      userId
    }
  });
};

export default handleIntegration;
