import r from '../src/server/database/rethinkDriver';

export default async function pretest() {
  const tables = await r.tableList();
  await Promise.all(tables.map(table => r.table(table).delete()));
  await r.getPool().drain();
}

