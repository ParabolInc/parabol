/**
 * Displays a group of reflection cards that have been purposefully grouped together.
 *
 * @flow
 */
import type {Reflection} from 'universal/types/retro';

// $FlowFixMe
import {ContentState, EditorState} from 'draft-js';
import React, {Component} from 'react';
import styled, {css} from 'react-emotion';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';
import editorDecorators from 'universal/components/TaskEditor/decorators';

import ReflectionGroupTitleEditor from './ReflectionGroupTitleEditor';

type Props = {
  handleSaveTitle?: (editorState: EditorState) => any,
  hoveredHeight?: number,
  title?: ContentState,
  // Note: `reflections` is treated as a stack where the "top" is the end of the array.
  reflections: Array<Reflection>
};

type State = {
  editorState: EditorState,
  isExpanded: boolean
};

const ExpandButton = styled(PlainButton)({
  height: '100%',
  width: '100%'
});

const ReflectionGroupWrapper = styled('div')({
  height: '100%',
  width: '100%'
});

const ReflectionGroupCollapsedWrapper = styled('div')({
  position: 'relative',
  height: '100%',
  width: '100%'
});

class ReflectionGroup extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const decorators = editorDecorators(this.getEditorState);
    this.state = {
      editorState: props.title
        ? EditorState.createWithContent(props.title, decorators)
        : EditorState.createEmpty(decorators),
      isExpanded: false
    };
  }

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  getEditorState = () => {
    return this.state.editorState;
  };

  getVisibleReflections = () => (
    this.props.reflections.slice(
      0,
      this.isHovering() ? 3 : 4
    )
  );

  collapse = () => {
    this.setState({isExpanded: false});
  };

  expand = () => {
    this.setState({isExpanded: true});
  };

  isHovering = (): boolean => (
    Boolean(this.props.hoveredHeight)
  );

  maybeRenderDropPlaceholder = () => {
    const {hoveredHeight} = this.props;
    if (!this.isHovering()) {
      return null;
    }
    const visibleReflections = this.getVisibleReflections();
    const styles = {
      position: 'absolute',
      transform: `scale(${1 - (0.05 * (visibleReflections.length))})`
    };
    return (
      <div className={css(styles)}>
        <ReflectionCardDropPreview height={hoveredHeight} />
      </div>
    );
  };

  maybeRenderTitleEditor = () => {
    const {handleSaveTitle} = this.props;
    const {editorState} = this.state;
    return handleSaveTitle && (
      <ReflectionGroupTitleEditor
        editorState={editorState}
        handleSave={handleSaveTitle}
        setEditorState={this.setEditorState}
      />
    );
  };

  renderCollapsed = () => (
    <ReflectionGroupCollapsedWrapper>
      <ExpandButton aria-label="Expand this reflection group" onClick={this.expand}>
        {this.getVisibleReflections().map(this.renderCollapsedReflection)}
      </ExpandButton>
    </ReflectionGroupCollapsedWrapper>
  );

  renderCollapsedReflection = (reflection: Reflection, index: number) => {
    const visibleReflections = this.getVisibleReflections();
    const isHovering = this.isHovering();
    const styles = {
      position: 'absolute',
      transform: `scale(${1 - (0.05 * (visibleReflections.length - index - 1))})`,
      top: `${((index + (isHovering ? 1 : 0)) / (visibleReflections.length + (isHovering ? 1 : 0))) * 1.5}rem`
    };
    return (
      <div className={css(styles)} key={reflection.id}>
        <ReflectionCard
          contentState={reflection.content}
          hovered={isHovering}
          id={reflection.id}
          stage={reflection.stage}
        />
      </div>
    );
  };

  renderExpanded = () => (
    <div>
      {this.props.reflections.map((reflection) => (
        <div className={css({marginBottom: 8})} key={reflection.id}>
          <ReflectionCard
            contentState={reflection.content}
            id={reflection.id}
            stage={reflection.stage}
          />
        </div>
      ))}
    </div>
  );

  render() {
    const {isExpanded} = this.state;
    return (
      <ReflectionGroupWrapper>
        {this.maybeRenderTitleEditor()}
        {this.maybeRenderDropPlaceholder()}
        {isExpanded ? this.renderExpanded() : this.renderCollapsed()}
      </ReflectionGroupWrapper>
    );
  }
}

export default ReflectionGroup;
