import React from 'react';
import PropTypes from 'prop-types';
import {createFragmentContainer} from 'react-relay';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const AgendaControl = styled('span')({
  color: ui.palette.warm,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline'
  }
});

const HelpTextForTeam = (props) => {
  const {agendaInputRef, currentTeamMember} = props;
  const handleAgendaControl = () => {
    agendaInputRef.focus();
  };
  const isCheckedInFalse = currentTeamMember.isCheckedIn === false;
  return (
    <span>
      <span>{isCheckedInFalse ? '(' : `(${currentTeamMember.preferredName} is sharing. `}</span>
      <AgendaControl onClick={handleAgendaControl}>{'Add agenda items'}</AgendaControl>
      {' for discussion.)'}
    </span>
  );
};

HelpTextForTeam.propTypes = {
  agendaInputRef: PropTypes.instanceOf(Element),
  currentTeamMember: PropTypes.object.isRequired
};

export default createFragmentContainer(
  HelpTextForTeam,
  graphql`
    fragment HelpTextForTeam_currentTeamMember on TeamMember {
      preferredName
      isCheckedIn
    }`
);
