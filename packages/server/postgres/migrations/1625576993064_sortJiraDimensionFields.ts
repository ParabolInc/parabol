import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'
import {r} from 'rethinkdb-ts'
import {parse} from 'url'
import Team from '../../database/types/Team'
import stringify from 'fast-json-stable-stringify'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const {hostname: host, port, path} = parse(process.env.RETHINKDB_URL)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: path.split('/')[1]
  })

  if (await r.tableList().contains('Team').run()) {
    const teams = (await r
      .table('Team')
      .filter(r.row('jiraDimensionFields').default([]).count().gt(0))
      .pluck('id', 'jiraDimensionFields')
      .run()) as Pick<Team, 'id' | 'jiraDimensionFields'>[]
    teams.forEach((team) => {
      team.jiraDimensionFields.sort((a, b) => (stringify(a) < stringify(b) ? -1 : 1))
    })
    await r(teams)
      .forEach((team) => {
        return r
          .table('Team')
          .get(team('id'))
          .update({
            jiraDimensionFields: team('jiraDimensionFields')
          })
      })
      .run()
  }

  pgm.sql(`
  CREATE OR REPLACE FUNCTION arr_sort (ANYARRAY)
    RETURNS ANYARRAY LANGUAGE SQL IMMUTABLE AS
    'SELECT ARRAY(SELECT unnest($1) ORDER BY 1);'
  `)
  pgm.sql(`
  UPDATE "Team"
    SET "jiraDimensionFields" = arr_sort("jiraDimensionFields")
    WHERE array_length("jiraDimensionFields", 1) > 1;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  //no op
}
