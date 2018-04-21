/**
 * A button used to add a reflection during the reflect phase of the
 * retrospective meeting.
 *
 * @flow
 */
import * as React from 'react';
import styled from 'react-emotion';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import CreateReflectionMutation from 'universal/mutations/CreateReflectionMutation';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {createFragmentContainer} from 'react-relay';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import StyledError from 'universal/components/StyledError';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import PlainButton from 'universal/components/PlainButton/PlainButton';
import type {RetroReflectionGroup} from 'universal/types/schema.flow';
import type {AddReflectionButton_retroPhaseItem as RetroPhaseItem} from './__generated__/AddReflectionButton_retroPhaseItem.graphql';
import type {AddReflectionButton_meeting as Meeting} from './__generated__/AddReflectionButton_meeting.graphql';

const {Component} = React;

type Props = {
  atmosphere: Object,
  columnReflectionGroups: Array<RetroReflectionGroup>,
  retroPhaseItem: RetroPhaseItem,
  meeting: Meeting,
  ...MutationProps
};

const Plus = styled('span')({
  paddingRight: '0.5rem'
});

const AddButton = styled(PlainButton)({
  backgroundColor: ui.cardControlBackgroundColor,
  borderRadius: ui.cardBorderRadius,
  color: appTheme.palette.mid,
  fontSize: '.875rem',
  minHeight: '3rem', // intended to match ReflectionCard
  padding: '.75rem',
  textAlign: 'center',
  transition: ui.cardControlTransition,
  userSelect: 'none',
  width: '100%',

  '&:hover,:focus': {
    backgroundColor: ui.palette.white,
    boxShadow: ui.cardBoxShadow, // intended to match ReflectionCard
    cursor: 'pointer'
  }
});

class AddReflectionButton extends Component<Props> {
  handleClick = () => {
    const {
      atmosphere,
      columnReflectionGroups,
      meeting: {meetingId},
      retroPhaseItem: {retroPhaseItemId},
      submitting,
      submitMutation,
      onCompleted,
      onError
    } = this.props;
    if (submitting) return;
    const input = {
      retroPhaseItemId,
      sortOrder: getNextSortOrder(columnReflectionGroups)
    };
    submitMutation();
    CreateReflectionMutation(atmosphere, {input}, {meetingId}, onError, onCompleted);
  };

  render() {
    const {error, submitting} = this.props;
    return (
      <React.Fragment>
        <AddButton onClick={this.handleClick} waiting={submitting}>
          <Plus>{'+'}</Plus>
          <span>Add a reflection</span>
        </AddButton>
        {error && <StyledError>{error.message}</StyledError>}
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(AddReflectionButton)),
  graphql`
    fragment AddReflectionButton_retroPhaseItem on RetroPhaseItem {
      retroPhaseItemId: id
    }
    fragment AddReflectionButton_meeting on RetrospectiveMeeting {
      meetingId: id
    }
  `
);
