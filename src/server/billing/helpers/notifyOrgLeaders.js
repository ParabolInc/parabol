// const r = getRethink();
// import shortid from 'shortid';
//
// // for each org, for each billing leader, add a notification
// export default async function notifyOrgLeaders(orgDocs, cb) {
//   const orgMap = orgDocs.reduce((obj, doc) => {
//     obj[doc.id] = doc;
//     return obj;
//   }, {});
//   const orgIds = Object.keys(orgMap);
//   const orgsIdsToInclude = new Set(orgIds);
//   const dbOrgLeaders = await r.table('User')
//     .getAll(r.args(orgIds), {index: 'orgs'})
//     .distinct()
//     .pluck('id', 'orgs');
//   // Add notifications to each billing leader
//   const notificationsToInsert = [];
//   const orgLeaders = dbOrgLeaders.map((orgDoc) => ({...orgDoc, parentId: shortid.generate()}));
//
//   for (let i = 0; i < orgLeaders.length; i++) {
//     const {orgs, parentId, id: userId} = orgLeaders[i];
//     for (let j = 0; j < orgs.length; j++) {
//       const orgId = orgs[j];
//       if (orgsIdsToInclude.has(orgId)) {
//         const org = orgMap[orgId];
//         const notificationDoc = cb(org, parentId, userId);
//         notificationsToInsert.push(notificationDoc);
//       }
//     }
//   }
//   if (notificationsToInsert.length > 0) {
//     await r.table('Notification').insert(notificationsToInsert);
//   }
// }
