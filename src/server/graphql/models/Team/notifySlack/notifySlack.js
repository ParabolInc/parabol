import queryIntegrator from "../../../../utils/queryIntegrator";

const notifySlack = (type, teamId) => {
  console.log('notifySlack', type, teamId);
  queryIntegrator({
    action: 'notifySlack',
    payload: {
      type,
      teamId
    }
  });
};

export default notifySlack;
