import {R} from 'rethinkdb-ts'
import getPg, {closePg} from '../../postgres/getPg'

export const up = async function (r: R) {
  const BATCH_SIZE = 1000
  for (let i = 0; i < 1e5; i++) {
    const skip = i * BATCH_SIZE
    const res = await Promise.all([
      r
        .table('Organization')
        .skip(skip)
        .limit(BATCH_SIZE)
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
        .skip(skip)
        .limit(BATCH_SIZE)
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
        .skip(skip)
        .limit(BATCH_SIZE)
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
        .skip(skip)
        .limit(BATCH_SIZE)
        .update((row) => ({
          tier: r.branch(
            row('tier').eq('personal'),
            'starter',
            r.branch(row('tier').eq('pro'), 'team', row('tier'))
          )
        }))
        .run(),
      r
        .table('Team')
        .skip(skip)
        .limit(BATCH_SIZE)
        .update((row) => ({
          tier: r.branch(
            row('tier').eq('personal'),
            'starter',
            r.branch(row('tier').eq('pro'), 'team', row('tier'))
          )
        }))
        .run()
    ])

    const isComplete = res.every(
      (res) => res.skipped === 0 && res.unchanged === 0 && res.errors === 0 && res.replaced === 0
    )
    if (isComplete) break
  }

  const pg = getPg()

  await pg.query(
    `
    ALTER TYPE "TierEnum" RENAME VALUE 'personal' TO 'starter';
    ALTER TYPE "TierEnum" RENAME VALUE 'pro' TO 'team';
    `
  )
  closePg()
}

export const down = async function (r: R) {
  const BATCH_SIZE = 1000
  for (let i = 0; i < 1e5; i++) {
    const skip = i * BATCH_SIZE
    const res = await Promise.all([
      r
        .table('Organization')
        .skip(skip)
        .limit(BATCH_SIZE)
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
        .skip(skip)
        .limit(BATCH_SIZE)
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
        .skip(skip)
        .limit(BATCH_SIZE)
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
        .skip(skip)
        .limit(BATCH_SIZE)
        .update((row) => ({
          tier: r.branch(
            row('tier').eq('starter'),
            'personal',
            r.branch(row('tier').eq('team'), 'pro', row('tier'))
          )
        }))
        .run(),
      r
        .table('Team')
        .skip(skip)
        .limit(BATCH_SIZE)
        .update((row) => ({
          tier: r.branch(
            row('tier').eq('starter'),
            'personal',
            r.branch(row('tier').eq('team'), 'pro', row('tier'))
          )
        }))
        .run()
    ])
    const isComplete = res.every(
      (res) => res.skipped === 0 && res.unchanged === 0 && res.errors === 0 && res.replaced === 0
    )
    if (isComplete) break
  }
  const pg = getPg()
  await pg.query(
    `
    ALTER TYPE "TierEnum" RENAME VALUE 'starter' TO 'personal';
    ALTER TYPE "TierEnum" RENAME VALUE 'team' TO 'pro';
    `
  )
  closePg()
}
