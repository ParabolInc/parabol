/**
 * Edits the name of a reflection group.
 *
 * @flow
 */
import * as React from 'react';
import styled from 'react-emotion';
import StyledError from 'universal/components/StyledError';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import UpdateReflectionGroupTitleMutation from 'universal/mutations/UpdateReflectionGroupTitleMutation';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import type {ReflectionGroupTitleEditor_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupTitleEditor_reflectionGroup.graphql'; // eslint-disable-line
import type {ReflectionGroupTitleEditor_meeting as Meeting} from './__generated__/ReflectionGroupTitleEditor_meeting.graphql';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import {RETRO_TOPIC_LABEL} from 'universal/utils/constants';

const {Component} = React;

type Props = {
  ...MutationProps,
  reflectionGroup: ReflectionGroup,
  readOnly: boolean,
  meeting: Meeting
};

const underlineStyles = {
  backgroundColor: 'transparent',
  borderLeftColor: 'transparent !important',
  borderRightColor: 'transparent !important',
  borderTopColor: 'transparent !important',
  boxShadow: 'none !important'
};


const PencilIcon = styled(StyledFontAwesome)({
  color: ui.hintFontColor,
  height: ui.iconSize,
  left: '100%',
  lineHeight: ui.cardThemeLabelLineHeight,
  opacity: '.5',
  position: 'absolute',
  textAlign: 'center',
  top: '-.0625rem',
  width: ui.iconSize
});

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

const getValidationError = (title: ?string, reflectionGroups, reflectionGroupId) => {
  if (!title || title.length < 1) {
    return 'Enter a title';
  }
  const usedTitles = reflectionGroups
    .filter((group) => group.id !== reflectionGroupId)
    .map((group) => group.title);
  if (usedTitles.includes(title)) {
    return 'You already used that name';
  }
  // TODO check for duplicate titles
  return undefined;
};

class ReflectionGroupTitleEditor extends Component<Props> {
  constructor(props) {
    super(props);
    this.initialTitle = props.reflectionGroup.title;
  }
  onChange = (e) => {
    const {atmosphere, dirty, error, onCompleted, onError, meeting: {reflectionGroups}, reflectionGroup: {reflectionGroupId}} = this.props;
    const title = e.target.value;
    commitLocalUpdate(atmosphere, (store) => {
      const reflectionGroup = store.get(reflectionGroupId);
      reflectionGroup.setValue(title, 'title');
    });
    if (dirty) {
      const normalizedTitle = title.trim();
      const validationError = getValidationError(normalizedTitle, reflectionGroups, reflectionGroupId);
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
    if (this.inputRef.current) {
      this.inputRef.current.select();
    }
  };

  onSubmit = (e) => {
    e.preventDefault();
    const {
      atmosphere,
      setDirty,
      submitting,
      submitMutation,
      onCompleted,
      onError,
      meeting: {reflectionGroups},
      reflectionGroup: {reflectionGroupId, title}
    } = this.props;
    if (submitting || title === this.initialTitle) return;
    this.initialTitle = title;
    // validate
    setDirty();
    const normalizedTitle = title.trim();
    const validationError = getValidationError(normalizedTitle, reflectionGroups, reflectionGroupId);
    if (validationError) {
      onError({message: validationError});
      return;
    }

    submitMutation();
    UpdateReflectionGroupTitleMutation(atmosphere, {title: normalizedTitle, reflectionGroupId}, onError, onCompleted);
  };

  initialTitle: string;
  inputRef = React.createRef();

  render() {
    const {error, readOnly, reflectionGroup: {title}} = this.props;
    return (
      <React.Fragment>
        <RootBlock>
          <FormBlock onSubmit={this.onSubmit}>
            <NameInput
              onBlur={this.onSubmit}
              onChange={this.onChange}
              placeholder={RETRO_TOPIC_LABEL}
              readOnly={readOnly}
              innerRef={this.inputRef}
              size={20}
              type="text"
              value={title || ''}
            />
          </FormBlock>
          {error && <StyledError>{error.message}</StyledError>}
        </RootBlock>
        {!readOnly && <PencilIcon name="pencil" onClick={this.onClick} />}
      </React.Fragment>
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
        id
        title
      }
    }
  `
);
