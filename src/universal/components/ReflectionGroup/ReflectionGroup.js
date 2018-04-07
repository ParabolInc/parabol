// @flow
import * as React from 'react';
import type {ReflectionGroupID} from 'universal/types/retro';
import styled from 'react-emotion';
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql';
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql';
import ui from 'universal/styles/ui';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ReflectionGroupHeader from 'universal/components/ReflectionGroupHeader';

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
    });
  }

  setTopCardRef = (c) => {
    this.topCardRef = c;
  };

  topCardRef: ?HTMLElement

  toggleExpanded = () => {
    const {atmosphere, isDraggingOver, reflectionGroup: {reflections, reflectionGroupId}} = this.props;
    if (isDraggingOver || reflections.length <= 1) return;
    commitLocalUpdate(atmosphere, (store) => {
      const reflectionGroupProxy = store.get(reflectionGroupId);
      reflectionGroupProxy.setValue(!reflectionGroupProxy.getValue('isExpanded'), 'isExpanded');
    });
  }

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
      `translateY(${yTranslate}rem)
       scale(${1 - (0.05 * interval)})`,
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
    const {meeting, reflectionGroup} = this.props;
    const {isExpanded, reflections} = reflectionGroup;

    // the transform used to collapse cards results in a bad parent element height, which means overlapping groups
    const style = !isExpanded && this.topCardRef && reflections.length > 1 &&
      {height: reflections.length * 8 + this.topCardRef.clientHeight + ui.retroCardCollapsedHeightRem * 8} || {};
    return (
      <div>
        {reflections.length > 1 && <ReflectionGroupHeader meeting={meeting} reflectionGroup={reflectionGroup} />}
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
      ...ReflectionGroupHeader_meeting
    }
    fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupHeader_reflectionGroup
      isExpanded
      reflectionGroupId: id
      sortOrder
      reflections {
        id
        retroPhaseItemId
        ...DraggableReflectionCard_reflection
        ...ReflectionCard_reflection
      }
    }
  `
);
