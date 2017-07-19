import getRethink from 'server/database/rethinkDriver';

const getProviderRowData = (service, teamId) => {
  const r = getRethink();
  return r.expr({
    integrationCount: r.table(service)
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