const r = getRethink();
import shortid from 'shortid';

// for each org, for each billing leader, add a notification
export default async function notifyOrgLeaders(orgDocs, cb) {
  const orgIds = orgDocs.map((orgDoc) => orgDoc.id);
  const orgsToInclude = new Set(orgIds);
  const orgLeaders = await r.table('User')
    .getAll(r.args(orgIds), {index: 'orgs'})
    .distinct()
    .pluck('id', 'orgs');
  // Add notifications to each billing leader
  const notificationsToInsert = [];
  // FIXME abstract orgDoc to include parentId
  const parentNotifications = orgDocs.reduce((obj, orgDoc) => {
    obj[orgId] = shortid.generate();
    return obj;
  }, {});

  for (let i = 0; i < orgLeaders.length; i++) {
    const {orgs, id: userId} = orgLeaders[i];
    for (let j = 0; j < orgs.length; j++) {
      const orgId = orgs[j];
      const parentId = parentNotifications[orgId];
      if (orgsToInclude.has(orgId)) {
        const notificationDoc = cb(orgId, parentId, userId);
        notificationsToInsert.push(notificationDoc);
      }
    }
  }
  if (notificationsToInsert.length > 0) {
    await r.table('Notification').insert(notificationsToInsert);
  }
}
