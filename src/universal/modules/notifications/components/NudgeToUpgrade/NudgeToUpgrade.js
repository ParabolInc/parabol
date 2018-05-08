// import {css} from 'react-emotion';
// import PropTypes from 'prop-types';
// import React from 'react';
// // import {createFragmentContainer} from 'react-relay';
// // import {withRouter} from 'react-router-dom';
// import {Button, IconAvatar, Row} from 'universal/components';
// import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton';
// import defaultStyles from 'universal/modules/notifications/helpers/styles';
// import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
// import ui from 'universal/styles/ui';
// import {clearNotificationLabel} from '../../helpers/constants';
// import {PRO_LABEL} from 'universal/utils/constants';
//
// const NudgeToUpgrade = (props) => {
//   const {
//     atmosphere,
//     history,
//     notification,
//     submitting,
//     submitMutation,
//     onError,
//     onCompleted
//   } = props;
//   const {notificationId, organization: {orgName, orgId}} = notification;
//   const acknowledge = () => {
//     submitMutation();
//     ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
//   };
//   const goToOrg = () => {
//     submitMutation();
//     ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
//     history.push(`/me/organizations/${orgId}`);
//   };
//   const orgMemberRequesting = 'Francisco';
//   return (
//     <Row compact>
//       <div className={css(defaultStyles.icon)}>
//         <IconAvatar icon="bell" size="small" />
//       </div>
//       <div className={css(defaultStyles.message)}>
//         {`${orgMemberRequesting} wants to upgrade ${orgName} to the ${PRO_LABEL} tier.`}
//       </div>
//       <div className={css(defaultStyles.widerButton)}>
//         <Button
//           aria-label="Go to the Organization Billing view"
//           colorPalette="warm"
//           isBlock
//           label="See Options"
//           buttonSize={ui.notificationButtonSize}
//           type="submit"
//           onClick={goToOrg}
//           waiting={submitting}
//         />
//       </div>
//       <div className={css(defaultStyles.iconButton)}>
//         <AcknowledgeButton
//           aria-label={clearNotificationLabel}
//           onClick={acknowledge}
//           waiting={submitting}
//         />
//       </div>
//     </Row>
//   );
// };
//
// NudgeToUpgrade.propTypes = {
//   atmosphere: PropTypes.object.isRequired,
//   history: PropTypes.object.isRequired,
//   onCompleted: PropTypes.func.isRequired,
//   onError: PropTypes.func.isRequired,
//   submitMutation: PropTypes.func.isRequired,
//   submitting: PropTypes.bool,
//   notification: PropTypes.object.isRequired
// };
//
// export default NudgeToUpgrade;
//
// // TODO: make this a real notification
// // export default createFragmentContainer(
// //   withRouter(NudgeToUpgrade),
// //   graphql`
// //     fragment NudgeToUpgrade_notification on NotifyNudgeToUpgrade {
// //       notificationId: id
// //       organization {
// //         orgId: id
// //         orgName: name
// //       }
// //     }
// //   `
// // );
