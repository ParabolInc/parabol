// import r from 'server/database/rethinkDriver';
// import checkPermission from './checkPermission';
// import parseChannel from './parseChannel';
//
// const ROLLCALL = 'ROLLCALL';
// const PRESENT = 'PRESENT';
//
// export default async function mwPresencePublishIn(req, next) {
//   if (req.authTokenExpiredError) {
//     next(req.authTokenExpiredError);
//     return;
//   }
//   const {channel, variableString: meetingId} = parseChannel(req.channel);
//   if (channel !== 'presence') {
//     // allow authenticated folks to publish junk to silly channels, we can write some more middleware to shut this down later
//     next();
//     // next({name: 'Unauthorized publish', message: `You are not allowed to publish in ${meetingId}`});
//     return;
//   }
//   const {sub: userId} = req.socket.getAuthToken();
//   const {authorization} = req.socket;
//   if (!checkPermission(authorization, meetingId)) {
//     req.socket.authorization = await r.table('TeamMember').getAll(userId, {index: 'cachedUserId'});
//   }
//   if (checkPermission(authorization, meetingId)) {
//     const {data} = req;
//     if (data === ROLLCALL) {
//       req.data = {type: ROLLCALL};
//       next();
//     } else if (data === PRESENT) {
//       req.data = {
//         type: PRESENT,
//         user: userId
//       };
//     }
//     next();
//     return;
//   }
//
//   if (checkPermission(authorization, meetingId)) {
//     next();
//   } else {
//     next({name: 'Unauthorized subscription', message: `You are not a part of team ${meetingId}`});
//   }
//
//   const {socket, ...otherStuff} = req;
//   console.log(otherStuff);
//
// }
