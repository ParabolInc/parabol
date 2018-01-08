import getRethink from 'server/database/rethinkDriver';

const flushSocketConnections = async () => {
  const r = getRethink();
  return r.table('User')
    .update({
      connectedSockets: []
    });
};

const postDeploy = async () => {
  const r = getRethink();
  await flushSocketConnections();
  await r.getPoolMaster().drain();
  process.exit();
};

export default postDeploy;
