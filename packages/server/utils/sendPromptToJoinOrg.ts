import isCompanyDomain from "./isCompanyDomain";
import getRethink from "../database/rethinkDriver";
import NotificationPromptToJoinOrg from "../database/types/NotificationPromptToJoinOrg";

const hasEligibleOrg = async (activeDomain: string) => {
  const r = await getRethink()
  return r.table('Organization')
    .getAll(activeDomain, { index: 'activeDomain' })
    .filter(org => org('featureFlags').contains('promptToJoinOrg'))
    .filter(org => org('tier').ne('enterprise'))
    .filter(org =>
      r.table('OrganizationUser')
        .getAll(org('id'), { index: 'orgId' })
        .filter({ inactive: false, removedAt: null })
        .count()
        .gt(1)
    )
    .limit(1)
    .count()
    .gt(0)
    .run();
}

const sendPromptToJoinOrg = async (email, userId) => {
  const r = await getRethink()

  const activeDomain = email.split('@')[1]

  if (!isCompanyDomain(activeDomain)) {
    return
  }

  if (!(await hasEligibleOrg(activeDomain))) {
    return
  }

  const notificationToInsert = new NotificationPromptToJoinOrg({
    userId,
    activeDomain
  })

  await r.table('Notification').insert(notificationToInsert).run()
}

export default sendPromptToJoinOrg