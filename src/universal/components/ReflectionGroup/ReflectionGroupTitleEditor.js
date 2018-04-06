/**
 * Edits the name of a reflection group.
 *
 * @flow
 */
import React, {Component} from 'react';
import styled from 'react-emotion';
import StyledError from 'universal/components/StyledError';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import UpdateReflectionGroupTitleMutation from 'universal/mutations/UpdateReflectionGroupTitleMutation';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import type {ReflectionGroupTitleEditor_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupTitleEditor_reflectionGroup.graphql';
import type {ReflectionGroupTitleEditor_meeting as Meeting} from './__generated__/ReflectionGroupTitleEditor_meeting.graphql';

type Props = {
  ...MutationProps,
  reflectionGroup: ReflectionGroup,
  meeting: Meeting
};

const underlineStyles = {
  backgroundColor: 'transparent',
  borderLeftColor: 'transparent !important',
  borderRightColor: 'transparent !important',
  borderTopColor: 'transparent !important',
  boxShadow: 'none !important'
};

const NameInput = styled('input')({
  ...underlineStyles,
  ':hover,:focus,:active': {
    underlineStyles
  },
  ...ui.fieldBaseStyles,
  ...ui.fieldSizeStyles.small,
  boxShadow: 'none',
  fontSize: '1.2rem',
  color: appTheme.brand.primary.darkGray,
  textAlign: 'center'
});

const getValidationError = (title: ?string, reflectionGroups) => {
  if (!title || title.length < 1) {
    return 'Enter a title';
  }
  const usedTitles = reflectionGroups.map((group) => group.title);
  if (usedTitles.includes(title)) {
    return 'You already used that name';
  }
  // TODO check for duplicate titles
  return undefined;
};

class ReflectionGroupTitleEditor extends Component<Props> {
  state = {
    title: this.props.reflectionGroup.title || ''
  };
  onChange = (e) => {
    const {dirty, error, onCompleted, onError, meeting: {reflectionGroups}} = this.props;
    const title = e.target.value;
    this.setState({title});
    if (dirty) {
      const normalizedTitle = title.trim();
      const validationError = getValidationError(normalizedTitle, reflectionGroups);
      if (!validationError) {
        if (error) {
          onCompleted();
        }
      } else {
        onError({message: validationError});
      }
    }
  };

  onClick = () => {
    this.inputRef.focus();
  };

  onSubmit = (e) => {
    e.preventDefault();
    const {title} = this.state;
    const {
      atmosphere,
      setDirty,
      submitting,
      submitMutation,
      onCompleted,
      onError,
      meeting: {reflectionGroups},
      reflectionGroup: {reflectionGroupId, title: initialTitle}
    } = this.props;
    if (submitting || title === initialTitle) return;
    // validate
    setDirty();
    const normalizedTitle = title.trim();
    const validationError = getValidationError(normalizedTitle, reflectionGroups);
    if (validationError) {
      onError({message: validationError});
      return;
    }

    // resolve
    submitMutation();
    UpdateReflectionGroupTitleMutation(atmosphere, {title: normalizedTitle, reflectionGroupId}, onError, onCompleted);
  };

  setInputRef = (c) => {
    this.inputRef = c;
  };

  inputRef: ?HTMLElement;

  render() {
    const {title} = this.state;
    const {error, reflectionGroup} = this.props;
    console.log('smart', title, reflectionGroup.title)
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <NameInput
            onBlur={this.onSubmit}
            onChange={this.onChange}
            placeholder="group #1"
            ref={this.setInputRef}
            type="text"
            value={title}
          />
        </form>
        {error && <StyledError>{error.message}</StyledError>}
      </div>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(ReflectionGroupTitleEditor)),
  graphql`
    fragment ReflectionGroupTitleEditor_reflectionGroup on RetroReflectionGroup {
      reflectionGroupId: id
      title
    }
    fragment ReflectionGroupTitleEditor_meeting on RetrospectiveMeeting {
      reflectionGroups {
        title
      }
    }
  `
);
