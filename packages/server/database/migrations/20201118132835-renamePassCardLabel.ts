import {R} from 'rethinkdb-ts'

export const up = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .update({
        values: r.row('values').map((value) =>
          r.branch(
            value('isSpecial')
              .default(false)
              .eq(true)
              .and(value('label').eq('X')),
            value.merge({label: 'Pass'}),
            value
          )
        )
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .update({
        values: r.row('values').map((value) =>
          r.branch(
            value('isSpecial')
              .default(false)
              .eq(true)
              .and(value('label').eq('Pass')),
            value.merge({label: 'X'}),
            value
          )
        )
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}
