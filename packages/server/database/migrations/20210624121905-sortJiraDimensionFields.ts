import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('Team')
    .filter(r.row('jiraDimensionFields').default([]).count().gt(0))
    .update((team) => ({
      jiraDimensionFields: team('jiraDimensionFields')
        .default([])
        .orderBy((jiraDimensionField) => jiraDimensionField.coerceTo('string'))
    }))
}

export const down = async function (r: R) {
  //noop
}
