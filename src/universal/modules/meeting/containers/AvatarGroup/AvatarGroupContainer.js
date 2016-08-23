// import React, {Component, PropTypes} from 'react';
// import {connect} from 'react-redux';
// import {cashay} from 'cashay';
// import resolveMeetingMembers from 'universal/subscriptions/computed/resolveMeetingMembers';
// import AvatarGroup from 'universal/modules/meeting/components/AvatarGroup/AvatarGroup';
//
// const mapStateToProps = (state, props) => {
//   const {params: {teamId}} = props;
//   const {sub: userId} = state.auth.obj;
//   const members = cashay.computed('meetingMembers', [teamId, userId], resolveMeetingMembers);
//   return {
//     members
//   };
// };
//
// const AvatarGroupContainer = (props) => {
//   const {localPhase, members} = props;
//   return <AvatarGroup localPhase={localPhase} avatars={members}/>;
// }
