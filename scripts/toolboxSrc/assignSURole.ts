import getPg from '../../packages/server/postgres/getPg'
import yargs from 'yargs'
import {Logger} from '../../packages/server/utils/Logger'

async function assignSURole() {
  const argv = await yargs(process.argv.slice(2))
    .scriptName('assignSURole')
    .option('add', {
      alias: 'a',
      type: 'array',
      description: 'Add the su role to the list of users with the given emails',
    })
    .option('remove', {
      alias: 'r',
      type: 'array',
      description: 'Remove the su role from the list of users with the given emails',
    })
    .option('removeAll', {
      type: 'boolean',
      description: 'Remove the su role from all users',
    })
    .strict()
    .help('h')
    .alias('h', 'help')
    .argv

  const pg = getPg()
  if (argv.removeAll) {
    const res = await pg.query(`UPDATE "User" SET rol = null WHERE rol = 'su' RETURNING email`)
    Logger.log('Removed all', res.rows)
  }
  if (argv.add) {
    const res = await pg.query(`UPDATE "User" SET rol = 'su' WHERE email = ANY ($1) RETURNING email`, [argv.add])
    Logger.log('Added', res.rows)
  }
  if (argv.remove) {
    const res = await pg.query('UPDATE "User" SET rol = null WHERE email = ANY ($1) RETURNING email', [argv.remove])
    Logger.log('Removed', res.rows)
  }
  await pg.end()
}

assignSURole()
