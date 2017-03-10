import getRethink from './rethinkDriver';

export default async function cloneProdToDev() {
  const r = getRethink();
  try {
    await r.dbDrop('actionDevelopment');
  } catch (e) {
    // empty
  }
  await r.dbCreate('actionDevelopment');
  const list = await r.db('actionProduction').tableList();
  const promises = list.map((table) => r.db('actionProduction').table(table).config()
    .update({
      db: 'actionDevelopment'
    }));
  await Promise.all(promises);
  console.log('Move to actionDevelopment complete!');
  r.getPoolMaster().drain();
};
