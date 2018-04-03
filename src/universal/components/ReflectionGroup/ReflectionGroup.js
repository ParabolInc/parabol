/**
 * Displays a group of reflection cards that have been purposefully grouped together.
 *
 * @flow
 */
import type {Element} from 'react';
// $FlowFixMe
import React, {Component, Fragment} from 'react';
import type {ReflectionGroupID} from 'universal/types/retro';
import {css} from 'react-emotion';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';
import ui from 'universal/styles/ui';

import ReflectionGroupTitleEditor from './ReflectionGroupTitleEditor';
import {createFragmentContainer} from 'react-relay';
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql';
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql';

const animationTime = 200;

const animationTimeout = {
  enter: animationTime,
  exit: animationTime
};

export type Props = {
  handleSaveTitle?: (string) => any,
  hovered?: boolean,
  id: ReflectionGroupID,
  meeting: Meeting,
  // Note: `reflections` is treated as a stack where the "top" is the end of the array.
  reflectionGroup: ReflectionGroupType,
  retroPhaseItemId: string
};

type State = {
  isExpanded: boolean
};

class ReflectionGroup extends Component<Props, State> {
  state = {
    isExpanded: this.props.reflectionGroup.reflections.length === 1
  };

  getAnimatedCardsStyles = (extraStyles: ?Object) => ({
    transition: `transform ${animationTimeout.enter / 1000}s ease`,
    ...extraStyles
  });

  getCardElements = () => {
    const {hovered, reflectionGroup} = this.props;
    const {isExpanded} = this.state;
    const reflections = isExpanded ? reflectionGroup.reflections : this.getVisibleReflections();
    const cardElements = reflections.map((reflection, index) => ({
      element: this.renderReflection(reflection, index, index === reflections.length - 1),
      key: reflection.id
    }));
    return cardElements;
  };

  getCollapsedItemCount = () => (
    this.getVisibleReflections().length + (this.props.hovered ? 1 : 0)
  );

  getVisibleReflections = () => {
    const {hovered, reflectionGroup} = this.props;
    const {reflections} = reflectionGroup;
    if (hovered && reflections.length <= this.maxCollapsedItems - 1 || !hovered && reflections.length <= this.maxCollapsedItems) {
      return reflections;
    }
    return reflections.slice(
      reflections.length - (this.props.hovered ? this.maxCollapsedItems - 1 : this.maxCollapsedItems)
    );
  };

  maxCollapsedItems = 4;

  toggleExpanded = () => {
    const {isDraggingOver, reflectionGroup: {reflections}} = this.props;
    if (isDraggingOver || reflections.length === 0) return;
    this.setState({isExpanded: !this.state.isExpanded});
  }

  maybeRenderHeader = () => {
    const {handleSaveTitle, reflectionGroup: {reflectionGroupId, reflections, title}} = this.props;
    const styles = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 8
    };
    return handleSaveTitle && (
      <div className={css(styles)}>
        <ReflectionGroupTitleEditor
          id={reflectionGroupId}
          form={`reflection-group-title-${reflectionGroupId}`}
          title={title}
          onSubmit={({title: newTitle}) => handleSaveTitle(newTitle)}
        />
        <div className={css({marginLeft: '1rem', fontWeight: 600})}>{reflections.length}</div>
      </div>
    );
  };

  renderReflection = (reflection: Object, index: number, isTopCard: boolean) => {
    const {meeting, retroPhaseItemId} = this.props;
    const {isExpanded} = this.state;
    return isExpanded ? (
      <DraggableReflectionCard
        dndIndex={index}
        showOriginFooter={retroPhaseItemId !== reflection.retroPhaseItemId}
        meeting={meeting}
        reflection={reflection}
      />
    ) : (
      <ReflectionCard
        isCollapsed={!isTopCard}
        meeting={meeting}
        reflection={reflection}
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
    const {reflectionGroup: {reflections}} = this.props;
    return (
      <div>
        {this.maybeRenderHeader()}
        <div onClick={this.toggleExpanded}>
          {isExpanded || reflections.length === 1 ? this.renderExpandedCards() : this.renderCollapsedCards()}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
  ReflectionGroup,
  graphql`
    fragment ReflectionGroup_meeting on RetrospectiveMeeting {
      ...ReflectionCard_meeting
    }
    fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
      reflectionGroupId: id
      title
      reflections {
        id
        retroPhaseItemId
        ...DraggableReflectionCard_reflection
        ...ReflectionCard_reflection
      }
    }
  `
);
