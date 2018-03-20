/**
 * Displays a group of reflection cards that have been purposefully grouped together.
 *
 * @flow
 */
import type {Element} from 'react';
import type {Reflection, ReflectionGroupID} from 'universal/types/retro';

// $FlowFixMe
import React, {Component, Fragment} from 'react';
import {css} from 'react-emotion';
import {CSSTransition} from 'react-transition-group';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';
import ui from 'universal/styles/ui';

import ReflectionGroupTitleEditor from './ReflectionGroupTitleEditor';

const animationTime = 200;

const animationTimeout = {
  enter: animationTime,
  exit: animationTime
};

export type Props = {
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
  state = {
    isExpanded: false
  };

  getAnimatedCardsStyles = (extraStyles: ?Object) => ({
    transition: `transform ${animationTimeout.enter / 1000}s ease`,
    ...extraStyles
  });

  getCardElements = () => {
    const {hovered} = this.props;
    const {isExpanded} = this.state;
    const reflections = isExpanded ? this.props.reflections : this.getVisibleReflections();
    const cardElements = reflections.map((reflection, index) => ({
      element: this.renderReflection(reflection, index === reflections.length - 1),
      key: reflection.id
    }));
    return hovered ? (
      [
        {element: <ReflectionCardDropPreview />, key: 'reflection-card-drop-preview'},
        ...cardElements
      ]
    ) : (
      cardElements
    );
  };

  getCollapsedItemCount = () => (
    this.getVisibleReflections().length + (this.props.hovered ? 1 : 0)
  );

  getVisibleReflections = () => {
    const {hovered, reflections} = this.props;
    if (hovered && reflections.length <= this.maxCollapsedItems - 1 || !hovered && reflections.length <= this.maxCollapsedItems) {
      return reflections;
    }
    return this.props.reflections.slice(
      this.props.reflections.length - (this.props.hovered ? this.maxCollapsedItems - 1 : this.maxCollapsedItems)
    );
  };

  maxCollapsedItems = 4;

  collapse = () => {
    this.setState({isExpanded: false});
  };

  expand = () => {
    this.setState({isExpanded: true});
  };

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

  renderReflection = (reflection: Reflection, isTopCard: boolean) => {
    const {isExpanded} = this.state;
    return isExpanded ? (
      <DraggableReflectionCard
        contentState={reflection.content}
        handleBeginDrag={console.log}
        handleCancelDrag={console.log}
        handleDrop={console.log}
        hovered={this.props.hovered}
        id={reflection.id}
        isCollapsed={!this.state.isExpanded && !isTopCard}
        reflectionType={reflection.reflectionType}
      />
    ) : (
      <ReflectionCard
        contentState={reflection.content}
        hovered={this.props.hovered}
        id={reflection.id}
        isCollapsed={!this.state.isExpanded && !isTopCard}
        reflectionType={reflection.reflectionType}
      />
    );
  };

  renderCollapsedCards = () => {
    return (
      <Fragment>
        {this.getCardElements().map(({element, key}, index) => (
          this.renderCollapsedElement(element, key, index)
        ))}
      </Fragment>
    );
  };

  renderCollapsedElement = (element: Element<*>, key: string, index: number) => {
    const styles = this.getAnimatedCardsStyles({
      transform:
        `translateY(${-(index * (ui.retroCardCollapsedHeightRem - 0.5))}rem) ` +
        `scale(${1 - (0.05 * (this.getCollapsedItemCount() - index - 1))})`
    });
    return (
      <div className={css(styles)} key={key}>
        {element}
      </div>
    );
  };

  renderExpandedCards = () => (
    <Fragment>
      {this.getCardElements().map(({element, key}) => (
        <div className={css(this.getAnimatedCardsStyles({marginBottom: 8}))} key={key}>
          {element}
        </div>
      ))}
    </Fragment>
  );

  render() {
    const {isExpanded} = this.state;
    return (
      <div>
        {this.maybeRenderHeader()}
        <PlainButton
          aria-label={isExpanded ? 'Collapse this reflection group' : 'Expand this reflection group'}
          onClick={isExpanded ? this.collapse : this.expand}
          type="button"
        >
          <div>
            <CSSTransition name="reflection-group-accordion" timeout={animationTimeout}>
              {isExpanded ? this.renderExpandedCards() : this.renderCollapsedCards()}
            </CSSTransition>
          </div>
        </PlainButton>
      </div>
    );
  }
}

export default ReflectionGroup;
