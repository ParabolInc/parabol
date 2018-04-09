/**
 * Renders the delete button for a retro card, which floats in the top-right
 * corner of the card.
 *
 * @flow
 */
import React, {Component} from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import appTheme from 'universal/styles/theme/appTheme';
import {createFragmentContainer} from 'react-relay';
import type {ReflectionCardDeleteButton_reflection as Reflection} from './__generated__/ReflectionCardDeleteButton_reflection.graphql';
import type {ReflectionCardDeleteButton_meeting as Meeting} from './__generated__/ReflectionCardDeleteButton_meeting.graphql';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';

type Props = {
  atmosphere: Object,
  reflection: Reflection,
  meeting: Meeting,
  ...MutationProps
};

const DeleteButton = styled(PlainButton)({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  color: appTheme.palette.warm,
  padding: '0.1rem',
  position: 'absolute',
  right: '-.6rem',
  top: '-.6rem'
});

class ReflectionCardDeleteButton extends Component<Props> {
  handleDelete = () => {
    const {atmosphere, onCompleted, onError, meeting: {meetingId}, reflection: {reflectionId}, submitMutation, submitting} = this.props;
    if (submitting) return;
    submitMutation();
    RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId}, onError, onCompleted);
  };

  render() {
    const {submitting} = this.props;
    if (submitting) return null;
    return (
      <DeleteButton
        aria-label="Delete this reflection card"
        onClick={this.handleDelete}
      >
        <FontAwesome name="times-circle" />
      </DeleteButton>
    );
  }
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(ReflectionCardDeleteButton)),
  graphql`
    fragment ReflectionCardDeleteButton_meeting on RetrospectiveMeeting {
      meetingId: id
    }
    fragment ReflectionCardDeleteButton_reflection on RetroReflection {
      reflectionId: id
    }
  `
);
