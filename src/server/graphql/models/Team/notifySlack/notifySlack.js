import queryIntegrator from '../../../../utils/queryIntegrator';

const notifySlack = (type, teamId) => {
  queryIntegrator({
    action: 'notifySlack',
    payload: {
      type,
      teamId
    }
  });
};

export default notifySlack;
