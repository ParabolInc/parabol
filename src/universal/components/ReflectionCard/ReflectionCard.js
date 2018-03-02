/**
 * Renders a fully visible retrospective reflection card.
 *
 * @flow
 */
// $FlowFixMe
import {EditorState, ContentState} from 'draft-js';
import React, {Component, Fragment} from 'react';
import styled, {css} from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import PlainButton from 'universal/components/PlainButton/PlainButton';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';

type Stage = 'positive' | 'negative' | 'change';

type Props = {
  // The draft-js content for this card
  contentState: ContentState,
  // The name of the user who is currently dragging this card to a new place, if any
  userDragging?: string,
  // The action to take when this card is deleted
  handleDelete?: () => any,
  // The action to take when this card is saved
  handleSave?: (editorState: EditorState) => any,
  // The stage of the meeting this was created during
  stage?: Stage
};

type State = {
  confirmingDelete: boolean,
  editorState: EditorState
};

const ReflectionCardMain = styled('div')({
  maxHeight: '10rem',
  overflow: 'auto',
  padding: '0.8rem'
});

const BottomBar = styled('div')({
  alignItems: 'flex-start',
  color: appTheme.palette.mid,
  display: 'flex',
  fontSize: '0.9rem',
  justifyContent: 'space-between',
  padding: '0.4rem 0.8rem'
});

const BottomLeft = styled('div')({
  width: '100%'
});

const BottomRight = styled('div')({
  alignSelf: 'flex-end',
  display: 'flex',
  flexShrink: 1.5,
  justifyContent: 'flex-end',
  width: '100%'
});

const TextButton = styled(PlainButton)({
  margin: '0 0.25rem',
  textDecoration: 'underline'
});

const getDisplayName = (stage: ?Stage): string => {
  switch (stage) {
    case 'positive':
      return "What's working?";
    case 'negative':
      return 'Where did you get stuck?';
    case 'change':
      return 'What might we do differently next time?';
    default:
      return '';
  }
};

export default class ReflectionCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      confirmingDelete: false,
      editorState: EditorState.createWithContent(
        props.contentState,
        editorDecorators(this.getEditorState)
      )
    };
  }

  getEditorState = () => (
    this.state.editorState
  );

  setConfirmingDelete = () => {
    this.setState({confirmingDelete: true});
  };

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  canDelete = () => (
    Boolean(this.props.handleDelete)
  );

  cancelDelete = () => {
    this.setState({confirmingDelete: false});
  };

  confirmDelete = () => {
    this.setState({confirmingDelete: false});
    if (this.props.handleDelete) {
      this.props.handleDelete();
    }
  };

  saveDeleteButton = (deleteButton: ?HTMLElement) => {
    this.deleteButton = deleteButton;
  };

  deleteButton: ?HTMLElement;

  maybeRenderBottomBar = () => {
    const {stage} = this.props;
    if (!stage && !this.canDelete()) {
      return null;
    }
    return (
      <BottomBar>
        {this.maybeRenderStage()}
        {this.maybeRenderDeleteSection()}
      </BottomBar>
    );
  };

  maybeRenderDeleteSection = () => {
    if (!this.canDelete()) {
      return null;
    }
    const {confirmingDelete} = this.state;
    return (
      <BottomRight>
        {confirmingDelete ? (
          <Fragment>
            <TextButton type="reset" onClick={this.cancelDelete}>Cancel</TextButton>
            <TextButton type="submit" onClick={this.confirmDelete}>Confirm</TextButton>
          </Fragment>
        ) : (
          <TextButton type="button" onClick={this.setConfirmingDelete}>Delete</TextButton>
        )}
      </BottomRight>
    );
  };

  maybeRenderStage = () => (
    <BottomLeft>{getDisplayName(this.props.stage)}</BottomLeft>
  );

  maybeRenderUserDragging = () => {
    const {userDragging} = this.props;
    const styles = {
      color: appTheme.palette.warm,
      textAlign: 'end'
    };
    return Boolean(userDragging) && (
      <div className={css(styles)}>
        {userDragging}
      </div>
    );
  };

  renderCardContent = () => {
    const {handleSave} = this.props;
    const {editorState} = this.state;
    return handleSave ? (
      <EditorInputWrapper
        ariaLabel="Edit this reflection"
        editorState={editorState}
        handleChange={this.cancelDelete}
        handleReturn={() => 'not-handled'}
        onBlur={handleSave && (() => handleSave(editorState))}
        placeholder="My reflection thought..."
        setEditorState={this.setEditorState}
      />
    ) : (
      <div>{editorState.getCurrentContent().getPlainText()}</div>
    );
  };

  render() {
    const {userDragging} = this.props;
    return (
      <div className={userDragging && css({opacity: 0.5})}>
        {this.maybeRenderUserDragging()}
        <ReflectionCardWrapper>
          <ReflectionCardMain>
            {this.renderCardContent()}
          </ReflectionCardMain>
          {this.maybeRenderBottomBar()}
        </ReflectionCardWrapper>
      </div>
    );
  }
}
