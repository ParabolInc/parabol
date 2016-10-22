import React, {PropTypes} from 'react';

const SummaryEmailContainer = (props) => {
  const {meeting} = props;
  const {id, invitees} = meeting;

  const referrerUrl = `https://action.parabol.co/summary/${id}`;
  const membersSansOutcomes = [];
  const membersWithOutcomes = [];
  let presentMemberCount = 0;
  let actionCount = 0;
  let projectCount = 0;

  for (let i = 0; i < invitees.length; i++) {
    const invitee = invitees[i];
    if (invitee.present) {
      presentMemberCount++;
    }
    const projLen = invitee.projects.length;
    const actionLen = invitee.actions.length;
    actionCount += actionLen;
    projectCount += projLen;
    const arr = (!projLen && !actionLen) ? membersSansOutcomes : membersWithOutcomes;
    arr.push(invitee);
  }

  return (
    <SummaryEmail
      actionCount={actionCount}
      meeting={meeting}
      membersSansOutcomes={membersSansOutcomes}
      membersWithOutcomes={membersWithOutcomes}
      presentMemberCount={presentMemberCount}
      projectCount={projectCount}
      referrer="email"
      referrerUrl={referrerUrl}
    />
  );
};

SummaryEmailContainer.propTypes = {
  meeting: PropTypes.object
};

export default SummaryEmailContainer;
