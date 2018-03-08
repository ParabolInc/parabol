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

import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';

type Props = {
  handleSaveName: (editorState: EditorState) => any,
  hoveredHeight?: number,
  name: ?ContentState,
  // Note: `reflections` is treated as a stack where the "top" is the end of the array.
  reflections: Array<Reflection>
};

const ReflectionGroupWrapper = styled('div')({
  position: 'relative'
});

class ReflectionGroup extends Component<Props> {
  getVisibleReflections = () => (
    this.props.reflections.slice(
      0,
      this.isHovering() ? 3 : 4
    )
  );

  isHovering = (): boolean => (
    Boolean(this.props.hoveredHeight)
  );

  maybeRenderDropPlaceholder = () => {
    const {hoveredHeight} = this.props;
    if (!this.isHovering) {
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

  renderReflection = (reflection: Reflection, index: number) => {
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

  render() {
    return (
      <ReflectionGroupWrapper>
        {this.maybeRenderDropPlaceholder()}
        {this.getVisibleReflections().map(this.renderReflection)}
      </ReflectionGroupWrapper>
    );
  }
}

export default ReflectionGroup;
