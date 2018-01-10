import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {DashSectionHeading} from 'universal/components/Dashboard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ToggleAgendaListMutation from 'universal/mutations/ToggleAgendaListMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import withMutationProps from 'universal/utils/relay/withMutationProps';

const AgendaHeader = (props) => {
  const {atmosphere, hideAgenda, styles, submitMutation, submitting, onError, onCompleted, teamId} = props;
  const toggleHide = () => {
    if (!submitting) {
      submitMutation();
      ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted);
    }
  };
  const label = `Agenda Queue${hideAgenda ? '...' : ''}`;
  return (
    <div className={css(styles.root)} onClick={toggleHide}>
      <DashSectionHeading icon="comment" label={label} />
    </div>
  );
};

AgendaHeader.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  hideAgenda: PropTypes.bool,
  styles: PropTypes.object,
  teamId: PropTypes.string,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

const styleThunk = () => ({
  root: {
    cursor: 'pointer',
    padding: '1rem 1rem 1rem 2.375rem',
    width: '100%',
    maxWidth: ui.dashAgendaWidth,
    minWidth: ui.dashAgendaWidth
  }
});

export default withMutationProps(withAtmosphere(withStyles(styleThunk)(AgendaHeader)));
