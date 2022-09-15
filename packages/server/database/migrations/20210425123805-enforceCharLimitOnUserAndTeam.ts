import {
  TEAM_NAME_LIMIT,
  USER_EMAIL_LIMIT,
  USER_PREFERRED_NAME_LIMIT
} from '../../postgres/constants'

const teamIdsWithTooLongNames = ['p_PZKkjmX', 'PQ8s3SUnt', 'yON8V5niok', 'yeV_e3hUw']

const userIdsWithTooLongNames = [
  'local|nm0nwe77AA',
  'local|25_i0w4u',
  'local|1BIzNRvD',
  'local|1wzYF43N'
]

const userIdsWithTooLongEmails = ['local|nm0nwe77AA', 'local|1BIzNRvD', 'local|1wzYF43N']

/*
  Queries to get the ids:

  await r
    .table('Team')
    .merge({nameLen: r.row('name').count()})
    .filter(r.row('nameLen').gt(TEAM_NAME_LIMIT))
    .getField('id')
    .coerceTo('array')
    .run()
    
  await r
    .table('User')
    .merge({preferredNameLen: r.row('preferredName').count()})
    .filter(r.row('preferredNameLen').gt(USER_PREFERRED_NAME_LIMIT))
    .getField('id')
    .coerceTo('array')
    .run()

  await r
    .table('User')
    .merge({emailLen: r.row('email').count()})
    .filter(r.row('emailLen').gt(USER_EMAIL_LIMIT))
    .getField('id')
    .coerceTo('array')
    .run({arrayLimit: 300000})
*/

export const up = async function (r) {
  await Promise.all([
    r
      .table('Team')
      .getAll(r.args(teamIdsWithTooLongNames))
      .update({
        name: r.row('name').slice(0, TEAM_NAME_LIMIT)
      })
      .run(),
    r
      .table('User')
      .getAll(r.args(userIdsWithTooLongNames))
      .update({
        preferredName: r.row('preferredName').slice(0, USER_PREFERRED_NAME_LIMIT)
      })
      .run(),
    r
      .table('User')
      .getAll(r.args(userIdsWithTooLongEmails))
      .update({
        email: r.row('email').slice(0, USER_EMAIL_LIMIT)
      })
      .run()
  ])
}

export const down = function (r) {
  // noop
}
