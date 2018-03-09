/**
 * Displays a group of reflection cards that have been purposefully grouped together.
 *
 * @flow
 */
import type {Reflection, ReflectionGroupID} from 'universal/types/retro';

// $FlowFixMe
import React, {Component} from 'react';
import {css} from 'react-emotion';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';

import ReflectionGroupTitleEditor from './ReflectionGroupTitleEditor';

type Props = {
  handleSaveTitle?: (string) => any,
  hovered?: boolean,
  id: ReflectionGroupID,
  title?: string,
  // Note: `reflections` is treated as a stack where the "top" is the end of the array.
  reflections: Array<Reflection>
};

type State = {
  isExpanded: boolean
};

class ReflectionGroup extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }

  getVisibleReflections = () => (
    this.props.reflections.slice(
      0,
      this.props.hovered ? 3 : 4
    )
  );

  collapse = () => {
    this.setState({isExpanded: false});
  };

  expand = () => {
    this.setState({isExpanded: true});
  };

  maybeRenderDropPlaceholder = () => (
    this.props.hovered && (
      <ReflectionCardDropPreview />
    )
  );

  maybeRenderHeader = () => {
    const {handleSaveTitle, id, reflections, title} = this.props;
    const styles = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 8
    };
    return handleSaveTitle && (
      <div className={css(styles)}>
        <ReflectionGroupTitleEditor
          id={id}
          form={`reflection-group-title-${id}`}
          title={title}
          onSubmit={({title: newTitle}) => handleSaveTitle(newTitle)}
        />
        <div className={css({marginLeft: '1rem', fontWeight: 'bold'})}>{reflections.length}</div>
      </div>
    );
  };

  renderCollapsed = () => (
    <PlainButton aria-label="Expand this reflection group" onClick={this.expand}>
      {this.getVisibleReflections().map(this.renderCollapsedReflection)}
    </PlainButton>
  );

  renderCollapsedReflection = (reflection: Reflection, index: number) => {
    const {hovered} = this.props;
    const visibleReflections = this.getVisibleReflections();
    const styles = {
      transform:
        `translateY(${(hovered ? index + 1 : index) * -80}%) ` +
        `scale(${1 - (0.05 * (visibleReflections.length - index - 1))})`
    };
    return (
      <div className={css(styles)} key={reflection.id}>
        <ReflectionCard
          contentState={reflection.content}
          hovered={hovered}
          id={reflection.id}
          isCollapsed
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
      <div>
        {this.maybeRenderHeader()}
        {this.maybeRenderDropPlaceholder()}
        {isExpanded ? this.renderExpanded() : this.renderCollapsed()}
      </div>
    );
  }
}

export default ReflectionGroup;
