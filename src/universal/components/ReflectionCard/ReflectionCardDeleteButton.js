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
import ui from 'universal/styles/ui';
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
  backgroundColor: 'transparent',
  border: 0,
  height: ui.iconSize,
  lineHeight: ui.iconSize,
  padding: 0,
  position: 'absolute',
  right: '-.4375rem',
  top: '-.4375rem',
  width: ui.iconSize
});

const Background = styled('div')({
  backgroundColor: ui.palette.white,
  borderRadius: '100%',
  height: '.625rem',
  left: '.125rem',
  position: 'absolute',
  top: '.125rem',
  width: '.625rem',
  zIndex: 100
});

const Icon = styled(FontAwesome)({
  color: ui.palette.warm,
  height: ui.iconSize,
  lineHeight: ui.iconSize,
  position: 'relative',
  textAlign: 'center',
  width: ui.iconSize,
  zIndex: 200
});

class ReflectionCardDeleteButton extends Component<Props> {
  handleDelete = () => {
    const {
      atmosphere,
      onCompleted,
      onError,
      meeting: {meetingId},
      reflection: {reflectionId},
      submitMutation,
      submitting
    } = this.props;
    if (submitting) return;
    submitMutation();
    RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId}, onError, onCompleted);
  };

  render () {
    const {submitting} = this.props;
    const userLabel = 'Delete this reflection card';
    if (submitting) return null;
    return (
      <DeleteButton aria-label={userLabel} onClick={this.handleDelete} title={userLabel}>
        <Icon name="times-circle" />
        <Background />
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
