/**
 * Renders a fully visible retrospective reflection card.
 *
 * @flow
 */
// $FlowFixMe
import {EditorState, ContentState} from 'draft-js';
import React, {Component} from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import PlainButton from 'universal/components/PlainButton/PlainButton';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';

type Stage = 'positive' | 'negative' | 'change';

type Props = {
  // The draft-js content for this card
  contentState: ContentState,
  // The action to take when this card is deleted
  handleDelete?: () => any,
  // The action to take when this card is saved
  handleSave?: (editorState: EditorState) => any,
  // The stage of the meeting this was created during
  stage?: Stage
};

type State = {
  editorState: EditorState,
  showDelete: boolean
};

const DeleteButton = styled(PlainButton)({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  color: 'red',
  position: 'absolute',
  top: '-0.5rem',
  right: '-0.5rem',
  zIndex: 1
});

const ReflectionCardMain = styled('div')({
  maxHeight: '10rem',
  overflow: 'auto',
  padding: '0.8rem'
});

const StageLabel = styled('div')({
  color: appTheme.palette.mid,
  padding: '0.4rem 0.8rem'
});

const stageDisplayNames = {
  positive: "What's working?",
  negative: 'Where did you get stuck?',
  change: 'What might we do differently next time?'
};

export default class ReflectionCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editorState: EditorState.createWithContent(
        props.contentState,
        editorDecorators(this.getEditorState)
      ),
      showDelete: false
    };
  }

  componentDidMount() {
    if (this.deleteButton) {
      this.deleteButton.addEventListener('focus', this.showDelete);
      // $FlowFixMe - flow wants us to wrap this in another if (deleteButton)
      this.deleteButton.addEventListener('blur', this.hideDelete);
    }
  }

  componentWillUnmount() {
    if (this.deleteButton) {
      this.deleteButton.removeEventListener('focus', this.showDelete);
    }
    if (this.deleteButton) { // flow makes us check this twice...
      this.deleteButton.removeEventListener('blur', this.hideDelete);
    }
  }

  getEditorState = () => (
    this.state.editorState
  );

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  showDelete = () => {
    this.setState({showDelete: true});
  };

  hideDelete = () => {
    this.setState({showDelete: false});
  };

  saveDeleteButton = (deleteButton: ?HTMLElement) => {
    this.deleteButton = deleteButton;
  };

  deleteButton: ?HTMLElement;

  renderCardContent = () => {
    const {handleSave} = this.props;
    const {editorState} = this.state;
    return handleSave ? (
      <EditorInputWrapper
        ariaLabel="Edit this reflection"
        editorState={editorState}
        handleReturn={() => 'not-handled'}
        onBlur={handleSave && (() => handleSave(editorState))}
        placeholder="My reflection thought..."
        setEditorState={this.setEditorState}
      />
    ) : (
      <div>{editorState.getCurrentContent().getPlainText()}</div>
    );
  };

  renderDelete = () => {
    const {handleDelete} = this.props;
    const {showDelete} = this.state;
    return (
      <DeleteButton innerRef={this.saveDeleteButton} aria-label="Delete this reflection" onClick={handleDelete}>
        {showDelete && <FontAwesome name="times-circle" />}
      </DeleteButton>
    );
  };

  render() {
    const {handleDelete, stage} = this.props;
    const canDelete = Boolean(handleDelete);
    return (
      <ReflectionCardWrapper
        onMouseEnter={canDelete && this.showDelete}
        onMouseLeave={canDelete && this.hideDelete}
      >
        <ReflectionCardMain>
          {this.renderCardContent()}
        </ReflectionCardMain>
        {canDelete && this.renderDelete()}
        {stage && <StageLabel>{stageDisplayNames[stage]}</StageLabel>}
      </ReflectionCardWrapper>
    );
  }
}
