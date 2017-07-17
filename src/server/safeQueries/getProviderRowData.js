import getRethink from 'server/database/rethinkDriver';
import serviceToProvider from 'server/utils/serviceToProvider';

const getProviderRowData = (service, teamId) => {
  const integrationTable = serviceToProvider[service];
  const r = getRethink();
  return r.expr({
    integrationCount: r.table(integrationTable)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .count(),
    userCount: r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service})
      .count()
  });
};

export default getProviderRowData;