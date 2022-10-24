import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('MeetingTemplate')
    .get('aChristmasCarolRetrospectiveTemplate')
    .update({name: 'Christmas Retrospective 🎅🏼'})
    .run()
}

export const down = async function (r: R) {
  await r
    .table('MeetingTemplate')
    .get('aChristmasCarolRetrospectiveTemplate')
    .update({name: 'A Christmas Carol Retrospective 🎅🏼'})
    .run()
}
