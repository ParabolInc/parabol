/**
 * Displays a group of reflection cards that have been purposefully grouped together.
 *
 * @flow
 */
import type {Element} from 'react';
import * as React from 'react';
import type {ReflectionGroupID} from 'universal/types/retro';
import styled, {css} from 'react-emotion';
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import ReflectionGroupTitleEditor from './ReflectionGroupTitleEditor';
import {createFragmentContainer} from 'react-relay';
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql';
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql';
import ui from 'universal/styles/ui';

const {Component} = React;

export type Props = {
  handleSaveTitle?: (string) => any,
  hovered?: boolean,
  id: ReflectionGroupID,
  meeting: Meeting,
  reflectionGroup: ReflectionGroupType,
  retroPhaseItemId: string
};

type State = {
  isExpanded: boolean
};

const MARGIN = 8;

const Reflections = styled('div')({
  // position: 'relative'
});

const AnimatedCards = styled('div')({
  transition: 'all 200ms ease',
  margin: MARGIN
});

class ReflectionGroup extends Component<Props, State> {
  state = {
    isExpanded: this.props.reflectionGroup.reflections.length === 1
  };

  toggleExpanded = () => {
    const {isDraggingOver, reflectionGroup: {reflections}} = this.props;
    if (isDraggingOver || reflections.length <= 1) return;
    this.setState({isExpanded: !this.state.isExpanded});
  }

  maybeRenderHeader = () => {
    const {handleSaveTitle, reflectionGroup: {reflectionGroupId, reflections, title}} = this.props;
    const styles = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: MARGIN
    };
    return handleSaveTitle && (
      <div className={css(styles)}>
        <ReflectionGroupTitleEditor
          id={reflectionGroupId}
          form={`reflection-group-title-${reflectionGroupId}`}
          title={title}
          onSubmit={({title: newTitle}) => handleSaveTitle(newTitle)}
        />
        <div className={css({marginLeft: '1rem', fontWeight: 'bold'})}>{reflections.length}</div>
      </div>
    );
  };

  renderReflection = (reflection: Object, idx: number) => {
    const {meeting, retroPhaseItemId, isDraggingOver} = this.props;
    const {reflectionGroup: {reflections}} = this.props;
    const {isExpanded} = this.state;
    const isTopCard = idx === reflections.length - 1;
    const isCollapsed = isExpanded ? false : !isTopCard;
    const showOriginFooter = retroPhaseItemId !== reflection.retroPhaseItemId;
    const interval = reflections.length - idx - 1;

    const yTranslate = -idx * ui.retroCardCollapsedHeightRem;
    const style = {
      transform: !isExpanded &&
      `translateY(${yTranslate}rem) ` +
      `scale(${1 - (0.05 * interval)})`,
      transitionDelay: isExpanded ? `${20 * interval}ms` : `${10 * idx}ms`
    };
    return (
      <AnimatedCards key={reflection.id} style={style}>
        <DraggableReflectionCard
          dndIndex={idx}
          showOriginFooter={showOriginFooter}
          meeting={meeting}
          reflection={reflection}
          isCollapsed={isCollapsed}
        />
      </AnimatedCards>
    );
  };

  render() {
    const {reflectionGroup: {reflections}} = this.props;
    return (
      <div>
        {this.maybeRenderHeader()}
        <Reflections onClick={this.toggleExpanded}>
          {reflections.map(this.renderReflection)}
        </Reflections>
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
