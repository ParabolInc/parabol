import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import ui from 'universal/styles/ui';

const UnpaidTeamModal = (props) => {
  const {isClosing, closeAfter, modalLayout, problem, solution, isALeader, handleClick} = props;
  return (
    <DashModal position="absolute" modalLayout={modalLayout} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Oh dear...
      </Type>
      <Type align="center" bold scale="s4">
        {problem}<br />
        {solution}<br />
      </Type>
      {isALeader &&
        <IconLink
          colorPalette="warm"
          icon="arrow-circle-right"
          iconPlacement="right"
          label="Take me there"
          margin="1.5rem 0 0"
          onClick={handleClick}
          scale="large"
        />
      }
    </DashModal>
  );
};

UnpaidTeamModal.propTypes = {
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  handleClick: PropTypes.func,
  isALeader: PropTypes.bool,
  isClosing: PropTypes.bool,
  modalLayout: PropTypes.oneOf(ui.modalLayout),
  router: PropTypes.object,
  orgId: PropTypes.string,
  problem: PropTypes.string,
  solution: PropTypes.string,
  teamName: PropTypes.string
};

export default UnpaidTeamModal;
