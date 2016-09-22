import React, {PropTypes} from 'react';
// import look, {StyleSheet} from 'react-look';
import labels from 'universal/styles/theme/labels';

// import {Field} from 'redux-form';

import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
// import OutcomeCardTextarea from 'universal/components/OutcomeCard/OutcomeCardTextarea';
// import OutcomeCardFooter from 'universal/components/OutcomeCard/OutcomeCardFooter';
// import OutcomeCardAssignMenu from 'universal/components/OutcomeCard/OutcomeCardAssignMenu';
// import OutcomeCardStatusMenu from 'universal/components/OutcomeCard/OutcomeCardStatusMenu';

// let styles = {};

const MeetingAgendaOutcomeCard = (props) => {
  const {outcome} = props;
  const {type, content} = outcome;
  const onEnterMeetingAgendaCard = () => {
    console.log('onEnterMeetingAgendaCard');
  };
  const onLeaveMeetingAgendaCard = () => {
    console.log('onLeaveMeetingAgendaCard');
  };
  return (
    <OutcomeCard
      isProject={type === 'project'}
      onEnterCard={onEnterMeetingAgendaCard}
      onLeaveCard={onLeaveMeetingAgendaCard}
      status={status}
    >
      <div style={{padding: '1rem'}}>
        content: {content}<br />
        id: {id}<br />
        status: {status}<br />
        type: {type}
      </div>
      {/* <OutcomeCardTextarea />
      <div className={styles.body}>
        <form>
          <Field
            component={OutcomeCardTextarea}
          />
        </form>
      </div>
      <OutcomeCardFooter /> */}
    </OutcomeCard>
  );
};

// styles = StyleSheet.create({
//   body: {
//     width: '100%'
//   }
// });

MeetingAgendaOutcomeCard.propTypes = {
  content: PropTypes.string,
  id: PropTypes.string,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  type: PropTypes.oneOf([
    'Action',
    'Project'
  ])
};

// export default look(MeetingAgendaOutcomeCard);
export default MeetingAgendaOutcomeCard;
