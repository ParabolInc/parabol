import getRethink from './rethinkDriver'

export default async function cloneProdToDev () {
  const r = getRethink()
  try {
    await r.dbDrop('cypress')
  } catch (e) {
    // empty
  }
  await r.dbCreate('cypress')
  const list = await r.db('test').tableList()
  const promises = list.map((table) =>
    r
      .db('cypress')
      .tableCreate(table)
      .then(() => {
        return r
          .db('cypress')
          .table(table)
          .insert(r.db('test').table(table))
      })
  )
  await Promise.all(promises)
  console.log('Move to cypress complete!')
  r.getPoolMaster().drain()
}
