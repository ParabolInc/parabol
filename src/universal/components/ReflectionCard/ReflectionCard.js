/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import {EditorState, ContentState} from 'draft-js';
import React, {Component} from 'react';
import styled, {css} from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

import ReflectionCardDeleteButton from './ReflectionCardDeleteButton';

export type Props = {|
  // The draft-js content for this card
  contentState: ContentState,
  // The action to take when this card is deleted
  handleDelete?: () => any,
  // The action to take when this card is saved
  handleSave?: (editorState: EditorState) => any,
  // True when this card is being hovered over by a valid drag source
  hovered?: boolean,
  // True when the current user is the one dragging this card
  iAmDragging?: boolean,
  // The unique ID of this reflection card
  id: string,
  // Whether we're "collapsed" e.g. in a stack of cards.  This allows us to truncate to a constant height,
  // Simplifying style computations.
  isCollapsed?: boolean,
  // Provided by react-dnd
  isDragging?: boolean,
  // States whether it serves as a drag preview.
  pulled?: boolean,
  // The reflection type, e.g. "negative" or "positive"
  reflectionType?: ?string,
  // The name of the user who is currently dragging this card to a new place, if any
  userDragging?: string,
|};

type State = {
  editorState: EditorState,
  mouseOver: boolean
};

type DnDStylesWrapperProps = {
  hovered?: boolean,
  pulled?: boolean,
  iAmDragging?: boolean
};

const BottomBar = styled('div')({
  alignItems: 'flex-start',
  color: appTheme.palette.mid,
  display: 'flex',
  fontSize: '0.9rem',
  justifyContent: 'space-between',
  padding: '0.4rem 0.8rem'
});

const DnDStylesWrapper = styled('div')(({pulled, iAmDragging}: DnDStylesWrapperProps) => ({
  opacity: ((iAmDragging && !pulled)) && 0.6
}));

const getDisplayName = (reflectionType: ?string): string => {
  switch (reflectionType) {
    case 'positive':
      return "What's working?";
    case 'negative':
      return 'Where did you get stuck?';
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
      ),
      mouseOver: false
    };
  }

  getEditorState = () => (
    this.state.editorState
  );

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  canDelete = () => (
    Boolean(this.props.handleDelete)
  );

  delete = () => {
    if (this.props.handleDelete) {
      this.props.handleDelete();
    }
  };

  saveDeleteButton = (deleteButton: ?HTMLButtonElement) => {
    this.deleteButton = deleteButton;
  };

  deleteButton: ?HTMLButtonElement;

  maybeRenderDelete = () => {
    const {mouseOver} = this.state;
    return this.canDelete() && (
      <ReflectionCardDeleteButton
        innerRef={this.saveDeleteButton}
        isVisible={mouseOver}
        onBlur={() => this.setState({mouseOver: false})}
        onClick={this.delete}
        onFocus={() => this.setState({mouseOver: true})}
      />
    );
  };

  maybeRenderReflectionType = () => {
    const {isCollapsed, reflectionType} = this.props;
    return !isCollapsed && reflectionType && <BottomBar>{getDisplayName(this.props.reflectionType)}</BottomBar>;
  };

  maybeRenderUserDragging = () => {
    const {isDragging, pulled, userDragging} = this.props;
    const styles = {
      color: appTheme.palette.warm,
      textAlign: 'end'
    };
    return (isDragging && !pulled) && (
      <div className={css(styles)}>
        {userDragging}
      </div>
    );
  };

  handleMouseEnter = () => {
    this.setState({mouseOver: true});
  };

  handleMouseLeave = () => {
    this.setState({mouseOver: false});
  };

  renderCardContent = () => {
    const {handleSave, isCollapsed} = this.props;
    const {editorState} = this.state;
    const styles: Object = {
      maxHeight: '10rem',
      overflow: 'auto',
      padding: '0.8rem'
    };
    if (isCollapsed) {
      styles.height = `${ui.retroCardCollapsedHeightRem}rem`;
      styles.overflow = 'hidden';
    }
    return (
      <div className={css(styles)}>
        {handleSave ? (
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
        )}
      </div>
    );
  };

  render() {
    const {hovered, iAmDragging, pulled, userDragging} = this.props;
    const holdingPlace = Boolean(userDragging && !pulled);
    return (
      <DnDStylesWrapper pulled={pulled} iAmDragging={iAmDragging} hovered={hovered}>
        {this.maybeRenderUserDragging()}
        <ReflectionCardWrapper
          holdingPlace={holdingPlace}
          hoveringOver={hovered}
          pulled={pulled}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.renderCardContent()}
          {this.maybeRenderReflectionType()}
          {this.maybeRenderDelete()}
        </ReflectionCardWrapper>
      </DnDStylesWrapper>
    );
  }
}
