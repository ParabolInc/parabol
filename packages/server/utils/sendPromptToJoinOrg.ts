import getRethink from "../database/rethinkDriver";
import NotificationPromptToJoinOrg from "../database/types/NotificationPromptToJoinOrg";
import isRequestToJoinDomainAllowed from "./isRequestToJoinDomainAllowed";

const sendPromptToJoinOrg = async (email, userId) => {
  const r = await getRethink()

  const activeDomain = email.split('@')[1]

  if (!(await isRequestToJoinDomainAllowed(activeDomain))) {
    return
  }

  const notificationToInsert = new NotificationPromptToJoinOrg({
    userId,
    activeDomain
  })

  await r.table('Notification').insert(notificationToInsert).run()
}

export default sendPromptToJoinOrg