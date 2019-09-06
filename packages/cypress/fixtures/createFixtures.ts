/*
 * To create fixtures:
 * Set the DB to test in .env
 * Migrate the DB: `yarn db:migrate`
 * Run a signup (manually, cypress@parabol.co, PW: cypress)
 * Update the userId to match the newly created user in ../support/commands.ts L40
 * Set durability to soft: `node packages/server/__tests__/setup/softenDurability.babel.js`
 * Clone DB to another DB namespace 'cypress': `node packages/server/database/cloneTestToCypress.babel.js`
 * Dump test and cypress DBs to rdb_test.tar.gz: `docker run --rm --link action-rethink -v $(pwd):/backup petecoop/rethinkdb-driver rethinkdb-dump -c 172.17.0.2:28015 -f /backup/packages/cypress/fixtures/rdb_test.tar.gz -e test -e cypress`
 * `chown $USER rdb_test2.tar.gz` and then rename it to rdb_test.tar.gz
 */
