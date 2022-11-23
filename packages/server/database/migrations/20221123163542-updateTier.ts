import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  const testa = await Promise.all([
    r
      .table('Organization')
      .update((row) => ({
        tier: r.branch(
          row('tier').eq('personal'),
          'starter',
          r.branch(row('tier').eq('pro'), 'team', row('tier'))
        )
      }))
      .run(),
    r
      .table('OrganizationUser')
      .update((row) => ({
        tier: r.branch(
          row('tier').default(null).eq('personal'),
          'starter',
          r.branch(row('tier').default(null).eq('pro'), 'team', row('tier').default(null))
        ),
        suggestedTier: r.branch(
          row('suggestedTier').default(null).eq('personal'),
          'starter',
          r.branch(
            row('suggestedTier').default(null).eq('pro'),
            'team',
            row('suggestedTier').default(null)
          )
        )
      }))
      .run(),
    r
      .table('Invoice')
      .update((row) => ({
        tier: r.branch(
          row('tier').eq('personal'),
          'starter',
          r.branch(row('tier').eq('pro'), 'team', row('tier'))
        )
      }))
      .run(),
    r
      .table('User')
      .update((row) => ({
        tier: r.branch(
          row('tier').eq('personal'),
          'starter',
          r.branch(row('tier').eq('pro'), 'team', row('tier'))
        )
      }))
      .run()
  ])
  console.log('🚀 ~ testa', testa)
}

export const down = async function (r: R) {
  const testDown = await Promise.all([
    r
      .table('Organization')
      .update((row) => ({
        tier: r.branch(
          row('tier').eq('starter'),
          'personal',
          r.branch(row('tier').eq('team'), 'pro', row('tier'))
        )
      }))
      .run(),
    r
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
          r.branch(row('suggestedTier').eq('team'), 'pro', row('suggestedTier').default(null))
        )
      }))
      .run(),
    r
      .table('Invoice')
      .update((row) => ({
        tier: r.branch(
          row('tier').eq('starter'),
          'personal',
          r.branch(row('tier').eq('team'), 'pro', row('tier'))
        )
      }))
      .run(),
    r
      .table('User')
      .update((row) => ({
        tier: r.branch(
          row('tier').eq('starter'),
          'personal',
          r.branch(row('tier').eq('team'), 'pro', row('tier'))
        )
      }))
      .run()
  ])
  console.log('🚀 ~ testDown', testDown)
}
