import r from '../src/server/database/rethinkdriver'; // eslint-disable-line id-length

export default async function pretest() {
  const tables = await r.tableList();
  await Promise.all(tables.map(table => r.table(table).delete()));
  await r.getPool().drain();
}
