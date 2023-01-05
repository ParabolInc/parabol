import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import getMailManager from '../../../email/getMailManager'

// get all orgs that have a scheduled lock
// if the lock has 7 days, send email
// if it's exceeded, update lockedAt

// const processScheduledLocks: MutationResolvers['processScheduledLocks'] = async (
const processScheduledLocks = async (_source, {seconds}, {dataLoader}) => {
  const r = await getRethink()
  const now = new Date().getTime()
  const inOneWeek = ms('7d')
  console.log('🚀 ~ inOneWeek', {inOneWeek, now})

  // RESOLUTION
  const orgsScheduledForLockWithinWeek = await r
    .table('Organization')
    .hasFields('scheduledLockAt')
    .filter((row) => row.hasFields('lockedAt').not().and(row('scheduledLockAt').lt(inOneWeek)))
    .run()
  console.log('🚀 ~ orgsScheduledForLockWithinWeek', orgsScheduledForLockWithinWeek)
  // loop through results and if the date is before today, return a promise locking the org
  // else return a promise to send an email

  const promises = orgsScheduledForLockWithinWeek.map((org) => {
    const scheduledLockAt = org.scheduledLockAt!.getTime()
    if (scheduledLockAt < now) {
      return [
        r
          .table('Organization')
          .get(org.id)
          .update({
            lockedAt: new Date()
          })
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
  console.log('🚀 ~ promises', promises

  return true
}

export default processScheduledLocks
