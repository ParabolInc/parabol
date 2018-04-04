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
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql';
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql';
import ui from 'universal/styles/ui';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const {Component} = React;

export type Props = {
  atmosphere: Object,
  handleSaveTitle?: (string) => any,
  hovered?: boolean,
  id: ReflectionGroupID,
  isDraggingOver: boolean,
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
  constructor(props) {
    super(props);
    const {atmosphere, reflectionGroup: {reflections, reflectionGroupId}} = props;
    const isExpanded = reflections.length === 1;
    // setTimeout is a workaround for https://github.com/atlassian/react-beautiful-dnd/issues/279
    setTimeout(() => {
      commitLocalUpdate(atmosphere, (store) => {
        const reflectionGroupProxy = store.get(reflectionGroupId);
        if (reflectionGroupProxy) {
          reflectionGroupProxy.setValue(isExpanded, 'isExpanded');
        }
      });
    })
  }

  setTopCardRef = (c) => {
    this.topCardRef = c;
  };

  toggleExpanded = () => {
    const {atmosphere, isDraggingOver, reflectionGroup: {reflections, reflectionGroupId}} = this.props;
    if (isDraggingOver || reflections.length <= 1) return;
    commitLocalUpdate(atmosphere, (store) => {
      const reflectionGroupProxy = store.get(reflectionGroupId);
      reflectionGroupProxy.setValue(!reflectionGroupProxy.getValue('isExpanded'), 'isExpanded');
    });
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
    const {meeting, retroPhaseItemId} = this.props;
    const {reflectionGroup: {isExpanded, reflections}} = this.props;
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
      <AnimatedCards key={reflection.id} style={style} innerRef={isTopCard ? this.setTopCardRef : undefined}>
        <DraggableReflectionCard
          dndIndex={idx}
          showOriginFooter={showOriginFooter}
          meeting={meeting}
          reflection={reflection}
          isExpanded={isExpanded}
          isCollapsed={isCollapsed}
        />
      </AnimatedCards>
    );
  };

  render() {
    const {reflectionGroup: {isExpanded, reflections}} = this.props;
    const style = !isExpanded && this.topCardRef && {height: reflections.length * 8 + this.topCardRef.clientHeight + ui.retroCardCollapsedHeightRem * 8} || {}
    return (
      <div>
        {this.maybeRenderHeader()}
        <Reflections onClick={this.toggleExpanded} style={style}>
          {reflections.map(this.renderReflection)}
        </Reflections>
      </div>
    );
  }
}

export default createFragmentContainer(
  withAtmosphere(ReflectionGroup),
  graphql`
    fragment ReflectionGroup_meeting on RetrospectiveMeeting {
      ...ReflectionCard_meeting
    }
    fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
      isExpanded
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
