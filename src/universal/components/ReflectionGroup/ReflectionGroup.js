/**
 * Displays a group of reflection cards that have been purposefully grouped together.
 *
 * @flow
 */
import type {Reflection, ReflectionGroupID} from 'universal/types/retro';

// $FlowFixMe
import React, {Component, Fragment} from 'react';
import {css} from 'react-emotion';
import {CSSTransition} from 'react-transition-group';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';

import ReflectionGroupTitleEditor from './ReflectionGroupTitleEditor';

const animationTimeout = {
  enter: 200,
  exit: 200
};

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

  getAnimatedCardsStyles = (extraStyles: ?Object) => ({
    transition: `transform ${animationTimeout.enter / 1000}s ease`,
    ...extraStyles
  });

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
    <Fragment>
      {this.getVisibleReflections().map(this.renderCollapsedReflection)}
    </Fragment>
  );

  renderCollapsedReflection = (reflection: Reflection, index: number) => {
    const {hovered} = this.props;
    const visibleReflections = this.getVisibleReflections();
    const styles = this.getAnimatedCardsStyles({
      transform:
        `translateY(${(hovered ? index + 1 : index) * -80}%) ` +
        `scale(${1 - (0.05 * (visibleReflections.length - index - 1))})`
    });
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
    <Fragment>
      {this.props.reflections.map((reflection) => (
        <div className={css(this.getAnimatedCardsStyles({marginBottom: 8}))} key={reflection.id}>
          <ReflectionCard
            contentState={reflection.content}
            id={reflection.id}
            stage={reflection.stage}
          />
        </div>
      ))}
    </Fragment>
  );

  render() {
    const {isExpanded} = this.state;
    return (
      <div>
        {this.maybeRenderHeader()}
        {this.maybeRenderDropPlaceholder()}
        <PlainButton
          aria-label={isExpanded ? 'Collapse this reflection group' : 'Expand this reflection group'}
          onClick={isExpanded ? this.collapse : this.expand}
        >
          <CSSTransition name="reflection-group-accordion" timeout={animationTimeout}>
            {isExpanded ? this.renderExpanded() : this.renderCollapsed()}
          </CSSTransition>
        </PlainButton>
      </div>
    );
  }
}

export default ReflectionGroup;
