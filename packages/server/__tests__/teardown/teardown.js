import getRethink from '../../database/rethinkDriver'
import junit from 'jest-junit-reporter'

export default async function teardown(results) {
  junit(results)

  // maybe consider thinking about flushing the DB
  if (process.pid % 10 === 0) {
    const r = await getRethink()
    const docs = await r
      .table('User')
      .count()
      .run()
    if (docs > 1000) {
      // flush the DB
      const list = await r
        .tableList()
        .filter((name) => name !== '_migrations')
        .run()
      const promises = list.map((table) =>
        r
          .table(table)
          .delete()
          .run()
      )
      await Promise.all(promises)
    }
    await r.getPoolMaster().drain()
  }
  // await new Promise((resolve) => setTimeout(() => res(), 50))
  process.exit()
}
