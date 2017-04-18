import queryIntegrator from "../utils/queryIntegrator";
import {handleRethinkRemove} from "../utils/makeChangefeedHandler";

const handleIntegration = async (accessToken, exchange, service, teamMemberId) => {
  const [userId] = teamMemberId.split('::');
  const channel = `integrations/${teamMemberId}`;
  console.log('handling integration', accessToken, service, teamMemberId);
  const oldToken = await queryIntegrator({
    action: 'setToken',
    payload: {
      accessToken,
      service,
      teamMemberId
    }
  });

  if (oldToken) {
    const clientDoc = handleRethinkRemove({id: oldToken});
    exchange.publish(channel, clientDoc);
  }
  // tell the subs that something new has arrived
  exchange.publish(channel, {
    type: 'add',
    fields: {
      id: accessToken,
      service,
      userId
    }
  });
};

export default handleIntegration;
