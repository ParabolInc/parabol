import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls';
import {cashay} from 'cashay';

const makeCheckinPressFactory = (teamMemberId, gotoNext) => (isCheckedIn) => () => {
  const options = {
    variables: {
      isCheckedIn,
      teamMemberId
    }
  };
  cashay.mutate('checkIn', options);
  gotoNext();
};

const CheckinCards = (props) => {
  const {
    gotoNext,
    members,
    localPhaseItem,
    styles
  } = props;
  const memberIdx = localPhaseItem - 1;
  const currentMember = members[memberIdx];
  const nextMember = memberIdx < members.length && members[memberIdx + 1];
  return (
    <div className={css(styles.base)}>
      <CheckInControls
        checkInPressFactory={makeCheckinPressFactory(currentMember.id, gotoNext)}
        member={currentMember}
        nextMember={nextMember}
      />
    </div>
  );
};

CheckinCards.propTypes = {
  gotoNext: PropTypes.func.isRequired,
  members: PropTypes.array,
  localPhaseItem: PropTypes.number,
  styles: PropTypes.object
};

const styleThunk = () => ({
  base: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem 0',
    width: '100%',

    [ui.breakpoint.wide]: {
      padding: '2rem 0'
    },

    [ui.breakpoint.wider]: {
      padding: '3rem 0'
    },

    [ui.breakpoint.widest]: {
      padding: '4rem 0'
    }
  }
});

export default withStyles(styleThunk)(CheckinCards);
