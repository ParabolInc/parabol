import getRethink from './rethinkDriver'

export default async function cloneProdToDev() {
  const r = await getRethink()
  try {
    await r.dbDrop('cypress').run()
  } catch (e) {
    // empty
  }
  await r.dbCreate('cypress').run()
  const list = await r
    .db('test')
    .tableList()
    .run()
  const promises = list.map((table) =>
    r
      .db('cypress')
      .tableCreate(table)
      .run()
      .then(() => {
        return r
          .db('cypress')
          .table(table)
          .insert(r.db('test').table(table))
          .run()
      })
  )
  await Promise.all(promises)
  console.log('Move to cypress complete!')
  r.getPoolMaster().drain()
}
