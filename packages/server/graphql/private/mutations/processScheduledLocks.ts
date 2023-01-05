import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import getMailManager from '../../../email/getMailManager'

// const processScheduledLocks: MutationResolvers['runScheduledJobs'] = async (
const processScheduledLocks = async (_source, _args, {dataLoader}) => {
  const r = await getRethink()
  const now = new Date().getTime()
  const inOneWeek = now + ms('7d')

  // RESOLUTION
  const orgsScheduledForLockWithinWeek = await r
    .table('Organization')
    .hasFields('scheduledLockAt')
    .filter((row) =>
      row
        .hasFields('lockedAt')
        .not()
        .and(row('scheduledLockAt').lt(r.epochTime(inOneWeek)))
    )
    .run()
  console.log('🚀 ~ orgsScheduledForLockWithinWeek', orgsScheduledForLockWithinWeek)

  const promises = orgsScheduledForLockWithinWeek.flatMap((org) => {
    const scheduledLockAt = org.scheduledLockAt!.getTime()
    if (scheduledLockAt < now) {
      return [
        r
          .table('Organization')
          .get(org.id)
          // .update({
          //   lockedAt: new Date()
          // })
          .run(),
        getMailManager().sendEmail({
          to: 'nick@parabol.co',
          subject: 'hellooo',
          body: 'hellooo',
          html: '<html><body>hellooo</body></html>'
        })
      ]
    } else {
      return getMailManager().sendEmail({
        to: 'nick@parabol.co',
        subject: 'hellooo dos',
        body: 'hellooo dos',
        html: '<html><body>hellooo dos</body></html>'
      })
    }
  })

  const testa = await Promise.all(promises)
  console.log('🚀 ~ ---', {promises, testa})

  return true
}

export default processScheduledLocks
