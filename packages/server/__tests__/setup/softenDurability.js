import getRethink from '../../database/rethinkDriver'

export default async function softenDurability() {
  const r = await getRethink()
  console.log('Softening durability for faster tests')
  const tables = await r.tableList().run()
  const promises = tables.map((table) =>
    r
      .table(table)
      .config()
      .update({
        durability: 'soft'
      })
      .run()
  )
  await Promise.all(promises)
  console.log('Table durability set to "soft"')
  process.exit()
}
