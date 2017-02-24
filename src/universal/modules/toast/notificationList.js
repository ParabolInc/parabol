// import fromNow from 'universal/utils/fromNow';
// import React from 'react';
// import Button from 'universal/components/Button/Button';
// import {cashay} from 'cashay';
//
// // export const TRIAL_EXPIRES_SOON = 'TRIAL_EXPIRES_SOON';
// // export const TRIAL_EXPIRED = 'TRIAL_EXPIRED';
// // export const PAYMENT_REJECTED = 'PAYMENT_REJECTED';
// // export const REQUEST_NEW_USER = 'REQUEST_NEW_USER';
// // export const ACCEPT_NEW_USER = 'ACCEPT_NEW_USER';
// // export const DENY_NEW_USER = 'DENY_NEW_USER';
//
//
// const normalizingLookup = {
//   TRIAL_EXPIRES_SOON: (variableList, router) => {
//     const expiresAt =  variableList[0];
//     const orgId = variableList[1];
//     const daysLeft = fromNow(expiresAt);
//     const content = `You're free trial will expire in ${daysLeft}. Want another free month? Just add your billing info`;
//   },
//   REQUEST_NEW_USER: (variableList) => ({
//     inviterName: variableList[0],
//     inviterId: variableList[1],
//     inviteeEmail: variableList[2],
//     invitedTeamName: variableList[3],
//     invitedTeamId: variableList[4],
//     orgId: variableList[5]
//   })
// };
//
// const makeMessageAndButtons = (type, variables) => {
//
// }
//
// export default function notificationNormalizer(type, varList, router) {
//   const normalizer = normalizingLookup[type];
//   return normalizer(varList);
// };
//
// //System.import...
// //
// // text
// // button group
// //
// // "You're free trial will expire in 10 days! Want another free month? Just add your billing info" ADD BIlling INFO
// //
// // "Terry has invited jordan@hotmail.co to the Product team" APPROVE/DENY
