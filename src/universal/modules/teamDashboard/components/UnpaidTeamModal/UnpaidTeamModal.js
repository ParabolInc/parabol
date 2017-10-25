import PropTypes from 'prop-types';
import React from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import ui from 'universal/styles/ui';

const UnpaidTeamModal = (props) => {
  const {isClosing, closeAfter, modalLayout, problem, solution, isALeader, handleClick} = props;
  return (
    <DashModal position="absolute" modalLayout={modalLayout} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Oh dear…
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        {problem}<br />
        {solution}<br />
      </Type>
      {isALeader &&
        <Button
          buttonStyle="flat"
          colorPalette="warm"
          icon="arrow-circle-right"
          iconPlacement="right"
          label="Take me there"
          onClick={handleClick}
          buttonSize="large"
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
  orgId: PropTypes.string,
  problem: PropTypes.string,
  solution: PropTypes.string,
  teamName: PropTypes.string
};

export default UnpaidTeamModal;
