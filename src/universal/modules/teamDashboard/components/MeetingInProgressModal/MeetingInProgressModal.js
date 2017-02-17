import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {withRouter} from 'react-router';
import portal from 'react-portal-hoc';

const MeetingInProgressModal = (props) => {
  const {closeAfter, isClosing, teamId, teamName, router} = props;
  const handleClick = () => {
    router.push(`/meeting/${teamId}`);
  };
  return (
    <DashModal position="absolute" modalContext="meetingInProgress" isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Oh, hi there!
      </Type>
      <Type align="center" bold scale="s4">
        The dashboard for {teamName} is disabled <br />
        as we are actively meeting to review <br />
        Projects and Agenda Items.
      </Type>
      <IconLink
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label="Join Meeting"
        margin="1.5rem 0 0"
        onClick={handleClick}
        scale="large"
      />
    </DashModal>
  );
};

MeetingInProgressModal.propTypes = {
  router: PropTypes.object,
  teamId: PropTypes.string,
  teamName: PropTypes.string
};

export default portal({closeAfter: 100})(withRouter(MeetingInProgressModal));
