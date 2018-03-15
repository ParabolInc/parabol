import PropTypes from 'prop-types';
import React from 'react';
import {DashSectionHeading} from 'universal/components/Dashboard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ToggleAgendaListMutation from 'universal/mutations/ToggleAgendaListMutation';
import ui from 'universal/styles/ui';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import styled from 'react-emotion';

const RootBlock = styled('div')({
  cursor: 'pointer',
  maxWidth: ui.dashAgendaWidth,
  minWidth: ui.dashAgendaWidth,
  width: '100%'
});

const AgendaHeader = (props) => {
  const {atmosphere, hideAgenda, submitMutation, submitting, onError, onCompleted, teamId} = props;
  const toggleHide = () => {
    if (!submitting) {
      submitMutation();
      ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted);
    }
  };
  const label = `Agenda Topics${hideAgenda ? '...' : ''}`;
  return (
    <RootBlock onClick={toggleHide}>
      <DashSectionHeading label={label} />
    </RootBlock>
  );
};

AgendaHeader.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  hideAgenda: PropTypes.bool,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  teamId: PropTypes.string
};

export default withMutationProps(withAtmosphere(AgendaHeader));
