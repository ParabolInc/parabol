import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import PropTypes from 'prop-types';
import {createFragmentContainer} from 'react-relay';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const HelpTextForTeam = (props) => {
  const {agendaInputRef, styles, currentTeamMember} = props;
  const handleAgendaControl = () => {
    agendaInputRef.focus();
  };
  return (
    <span className={css(styles.helpText)}>
      {`(${currentTeamMember.preferredName} is sharing. `}
      <span onClick={handleAgendaControl} className={css(styles.agendaControl)}>{'Add agenda items'}</span>
      {' to discuss new tasks.)'}
    </span>
  );
};

HelpTextForTeam.propTypes = {
  agendaInputRef: PropTypes.element.isRequired,
  styles: PropTypes.object,
  currentTeamMember: PropTypes.object.isRequired
};

const styleThunk = () => ({
  agendaControl: {
    color: ui.palette.warm,
    cursor: 'pointer',
    ':hover': {
      opacity: 0.5
    }
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(HelpTextForTeam),
  graphql`
    fragment HelpTextForTeam_currentTeamMember on TeamMember {
      preferredName
    }`
);
