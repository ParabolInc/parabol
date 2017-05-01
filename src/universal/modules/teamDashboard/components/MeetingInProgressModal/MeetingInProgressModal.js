import PropTypes from 'prop-types';
import React from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import {withRouter} from 'react-router';
import portal from 'react-portal-hoc';
import ui from 'universal/styles/ui';

const MeetingInProgressModal = (props) => {
  const {closeAfter, isClosing, modalLayout, teamId, teamName, router} = props;
  const handleClick = () => {
    router.push(`/meeting/${teamId}`);
  };
  return (
    <DashModal position="absolute" modalLayout={modalLayout} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Oh, hi there!
      </Type>
      <Type align="center" marginBottom="1rem" bold scale="s4">
        The dashboard for {teamName} is disabled <br />
        as we are actively meeting to review <br />
        Projects and Agenda Items.
      </Type>
      <Button
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label="Join Meeting"
        margin="1.5rem 0 0"
        onClick={handleClick}
        size="large"
      />
    </DashModal>
  );
};

MeetingInProgressModal.propTypes = {
  closeAfter: PropTypes.number,
  isClosing: PropTypes.bool,
  modalLayout: PropTypes.oneOf(ui.modalLayout),
  router: PropTypes.object,
  teamId: PropTypes.string,
  teamName: PropTypes.string
};

export default portal({closeAfter: 100})(withRouter(MeetingInProgressModal));
