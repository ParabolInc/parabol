import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import labels from 'universal/styles/theme/labels';

import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import OutcomeCardTextarea from 'universal/components/OutcomeCard/OutcomeCardTextarea';
import OutcomeCardFooter from 'universal/components/OutcomeCard/OutcomeCardFooter';
import OutcomeCardAssignMenu from 'universal/components/OutcomeCard/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from 'universal/components/OutcomeCard/OutcomeCardStatusMenu';

const MeetingAgendaOutcomeCard = (props) => {
  // const {currentAgendaItemId, myTeamMemberId, outcomes} = props;

  return (
    <OutcomeCard>
      {'Dumb'}
    </OutcomeCard>
  );
};

s = StyleSheet.create({
  // Define
});

MeetingAgendaOutcomeCard.propTypes = {
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  type: PropTypes.oneOf([
    'action',
    'project'
  ])
};

export default look(MeetingAgendaOutcomeCard);
