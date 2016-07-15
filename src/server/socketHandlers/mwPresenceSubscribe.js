// import r from 'server/database/rethinkDriver';
// import parseChannel from './parseChannel';
// import checkPermission from './checkPermission';
//
// export default async function mwPresenceSubscribe(req, next) {
//   if (req.authTokenExpiredError) {
//     next(req.authTokenExpiredError);
//     return;
//   }
//   const {channel, variableString: meetingId} = parseChannel(req.channel);
//   if (channel !== 'presence') {
//     // all auth is taken care of inside GraphQL
//     next();
//     return;
//   }
//   const {authorization} = req.socket;
//   req.socket.authorization = req.socket.authorization || [];
//   if (checkPermission(authorization, meetingId)) {
//     // this user can & has subscribed to something before
//     // if we want to revoke access in real time, we'll need another function to track down each socket owned by that user &
//     // remove that teamMember from their arrays
//     next();
//     return;
//   }
//
//   const authTokenObj = req.socket.getAuthToken();
//   // we're going around the standard graphql data transport here because there's no need to parse & exec
//   req.socket.authorization = await r.table('TeamMember').getAll(authTokenObj.sub, {index: 'userId'});
//   if (checkPermission(authorization, meetingId)) {
//     next();
//   } else {
//     next({name: 'Unauthorized subscription', message: `You are not a part of team ${meetingId}`});
//   }
// }
