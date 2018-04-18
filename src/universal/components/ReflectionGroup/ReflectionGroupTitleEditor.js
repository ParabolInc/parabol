/**
 * Edits the name of a reflection group.
 *
 * @flow
 */
import React, {Component} from 'react';
import styled from 'react-emotion';
import StyledError from 'universal/components/StyledError';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import UpdateReflectionGroupTitleMutation from 'universal/mutations/UpdateReflectionGroupTitleMutation';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import type {ReflectionGroupTitleEditor_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupTitleEditor_reflectionGroup.graphql'; // eslint-disable-line
import type {ReflectionGroupTitleEditor_meeting as Meeting} from './__generated__/ReflectionGroupTitleEditor_meeting.graphql';
import reactLifecyclesCompat from 'react-lifecycles-compat';

type Props = {
  ...MutationProps,
  reflectionGroup: ReflectionGroup,
  readOnly: boolean,
  meeting: Meeting
};

type State = {
  title: string
}
const underlineStyles = {
  backgroundColor: 'transparent',
  borderLeftColor: 'transparent !important',
  borderRightColor: 'transparent !important',
  borderTopColor: 'transparent !important',
  boxShadow: 'none !important'
};

const RootBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 1,
  maxWidth: '100%',
  padding: '0 .25rem'
});

const FormBlock = styled('form')({
  display: 'flex',
  flexShrink: 1,
  maxWidth: '100%'
});

const NameInput = styled('input')(({readOnly}) => ({
  ...underlineStyles,
  ':hover,:focus,:active': {
    underlineStyles
  },
  ...ui.fieldBaseStyles,
  ...ui.fieldSizeStyles.small,
  border: 0,
  boxShadow: 'none',
  color: appTheme.palette.dark,
  cursor: readOnly ? 'default' : 'text',
  fontSize: ui.cardThemeLabelFontSize,
  fontWeight: 600,
  lineHeight: ui.cardThemeLabelLineHeight,
  padding: 0,
  textAlign: 'center'
}));

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

class ReflectionGroupTitleEditor extends Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {reflectionGroup: {title}} = nextProps;
    if (title && title !== prevState.title) {
      return {
        title
      };
    }
    return null;
  }

  state = {
    title: ''
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
    if (this.inputRef) {
      this.inputRef.focus();
    }
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

    submitMutation();
    UpdateReflectionGroupTitleMutation(atmosphere, {title: normalizedTitle, reflectionGroupId}, onError, onCompleted);
  };

  setInputRef = (c) => {
    this.inputRef = c;
  };

  inputRef: ?HTMLElement;

  render() {
    const {title} = this.state;
    const {error, readOnly} = this.props;
    const maxlength = 20;
    const placeholder = 'Theme';
    const placeholderSize = placeholder.length;
    const titleSize = (title.length > maxlength) ? maxlength : title.length;
    const size = titleSize || placeholderSize;
    return (
      <RootBlock>
        <FormBlock onSubmit={this.onSubmit}>
          <NameInput
            onBlur={this.onSubmit}
            onChange={this.onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            ref={this.setInputRef}
            size={size}
            type="text"
            value={title}
          />
        </FormBlock>
        {error && <StyledError>{error.message}</StyledError>}
      </RootBlock>
    );
  }
}

reactLifecyclesCompat(ReflectionGroupTitleEditor);
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
