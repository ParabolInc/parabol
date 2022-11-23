import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('Organization')
    .update((row) => ({
      tier: r.branch(
        row('tier').eq('personal'),
        'starter',
        r.branch(row('tier').eq('pro'), 'team', row('tier'))
      )
    }))
    .run()

  await r
    .table('OrganizationUser')
    .update((row) => ({
      tier: r.branch(
        row('tier').eq('personal'),
        'starter',
        r.branch(row('tier').eq('pro'), 'team', row('tier'))
      ),
      suggestedTier: r.branch(
        row('suggestedTier').eq('personal'),
        'starter',
        r.branch(row('suggestedTier').eq('pro'), 'team', row('suggestedTier'))
      )
    }))
    .run()
}

export const down = async function (r: R) {
  await r
    .table('Organization')
    .update((row) => ({
      tier: r.branch(
        row('tier').eq('starter'),
        'personal',
        r.branch(row('tier').eq('team'), 'pro', row('tier'))
      )
    }))
    .run()

  await r
    .table('OrganizationUser')
    .update((row) => ({
      tier: r.branch(
        row('tier').eq('starter'),
        'personal',
        r.branch(row('tier').eq('team'), 'pro', row('tier'))
      ),
      suggestedTier: r.branch(
        row('suggestedTier').eq('starter'),
        'personal',
        r.branch(row('suggestedTier').eq('team'), 'pro', row('suggestedTier'))
      )
    }))
    .run()
}
