// import getRethink from '../../src/server/database/rethinkDriver'
// @ts-ignore
// import * as migrate from 'migrate-rethinkdb'
// import * as path from 'path'

// const DB_NAME = 'test'

/*
 * To create fixtures:
 * Set the DB to test in .env
 * Migrate the DB
 * Run a signup
 * Set durability to soft
 * Clone DB to 'cypress'
 * Dump test and cypress DBs to rdb_test.tar.gz
 */

// const createFixtures = async () => {
//   const r = getRethink()
//   try {
//     await r.dbDrop(DB_NAME)
//   } catch (e) {
//     /**/
//   }
//   try {
//     await r.dbCreate(DB_NAME)
//   } catch (e) {/**/
//   }
//
//   process.env.host = 'localhost'
//   process.env.port = '28015'
//   process.env.db = DB_NAME
//   process.env.r = process.cwd()
//
//   const root = path.join(__dirname, '../../src/server/database')
//   try {
//     await migrate.up({all: true, root})
//   } catch (e) {/**/
//     console.log('err mig', e)
//   }
//   // TODO clone DB to 'cypress' DB & set durability
// }
//
// createFixtures().catch()
