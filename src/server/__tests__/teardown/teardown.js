import getRethink from '../../database/rethinkDriver';
import junit from 'jest-junit-reporter';

export default async function teardown(results) {
  junit(results);

  // maybe consider thinking about flushing the DB
  if (process.pid % 10 === 0) {
    const r = getRethink();
    const docs = await r.table('User').count();
    if (docs > 1000) {
      // flush the DB
      const list = await r.tableList().filter((name) => name !== '_migrations');
      const promises = list.map((table) => r.table(table).delete());
      await Promise.all(promises);
    }
    await r.getPoolMaster().drain();
  }
  await new Promise(res => setTimeout(() => res(), 50));
  process.exit();
};
