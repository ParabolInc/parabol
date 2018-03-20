/**
 * Stories for reflection card drag-and-drop.
 *
 * @flow
 */
import type {Node} from 'react';
import type {
  Reflection,
  ReflectionID,
  ReflectionGroup as ReflectionGroupT,
  ReflectionGroupID
} from 'universal/types/retro';

// $FlowFixMe
import {ContentState} from 'draft-js';
import React, {Component} from 'react';
import {DropTarget} from 'react-dnd';
import {css} from 'react-emotion';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import ReflectionGroupingDragLayer from 'universal/components/ReflectionGroupingDragLayer/ReflectionGroupingDragLayer';
import DroppableReflectionGroup from 'universal/components/ReflectionGroup/DroppableReflectionGroup';
import {REFLECTION_CARD} from 'universal/utils/constants';
import count from 'universal/utils/count';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

type DragAndDropStoryState = {
  dragging: {[ReflectionID]: boolean},
  reflections: Array<Reflection>,
  groups: Array<ReflectionGroupT>
};

type ReflectionCatcherProps = {
  children: Node,
  connectDropTarget: (Node) => Node,
  ungroupedReflections: Array<Reflection>,
  handleUngroup: (reflectionId: ReflectionID) => any
};

const reflectionCatcherSpec = {
  canDrop(props: ReflectionCatcherProps, monitor) {
    const {ungroupedReflections} = props;
    const {id: draggedReflectionId} = monitor.getItem();
    return monitor.isOver({shallow: true}) &&
      !ungroupedReflections.find((reflection) =>
        reflection.id === draggedReflectionId
      );
  },

  drop(props: ReflectionCatcherProps, monitor) {
    props.handleUngroup(monitor.getItem().id);
  }
};

const reflectionCatcherCollect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

const ReflectionCatcher = DropTarget(REFLECTION_CARD, reflectionCatcherSpec, reflectionCatcherCollect)(
  (props: ReflectionCatcherProps) => (
    props.connectDropTarget(
      <div className={css({width: '100%', height: '100%'})}>
        {props.children}
      </div>
    )
  )
);

class DragAndDropStory extends Component<*, DragAndDropStoryState> {
  state = {
    dragging: {
      card1: false,
      card2: false,
      card3: false
    },
    groups: [],
    reflections: [
      {
        id: 'card1',
        content: ContentState.createFromText('My pithy reflection is to be heard'),
        reflectionType: null
      },
      {
        id: 'card2',
        content: ContentState.createFromText('No, MY reflection shall be heard loudest!!!'),
        reflectionType: null
      },
      {
        id: 'card3',
        content: ContentState.createFromText('Wait, what about me?'),
        reflectionType: null
      }
    ]
  };

  getReflectionById = (id: ReflectionID): ?Reflection => {
    return this.state.reflections.find((reflection) => reflection.id === id);
  };

  getUngroupedReflections = () => {
    const {groups, reflections} = this.state;
    return reflections.filter((reflection) =>
      !groups.find((group) => group.reflections.includes(reflection))
    );
  };

  ids = count();

  handleCancelDrag = (cardId: ReflectionID) => {
    this.setState(({dragging}: DragAndDropStoryState) => ({dragging: {...dragging, [cardId]: false}}));
    action('cancel-drag')(cardId);
  };

  handleBeginDrag = (cardId: ReflectionID) => {
    this.setState(({dragging}: DragAndDropStoryState) => ({dragging: {...dragging, [cardId]: true}}));
    action('begin-drag')(cardId);
  };

  handleCardOnCardDrop = (draggedId: ReflectionID, droppedId: ReflectionID) => {
    this.setState((state: DragAndDropStoryState) => {
      const newGroup = {
        id: `group-${this.ids.next().value}`,
        title: '',
        reflections: [this.getReflectionById(draggedId), this.getReflectionById(droppedId)].filter(Boolean)
      };
      return {
        dragging: {...state.dragging, [draggedId]: false},
        groups: [...this.removeReflectionFromGroups(state.groups, draggedId), newGroup]
      };
    });
    action('drop-card-on-card')(draggedId, droppedId);
  };

  handleCardOnGroupDrop = (draggedId: ReflectionID, groupId: ReflectionGroupID) => {
    this.setState((state: DragAndDropStoryState) => {
      const newGroups = this.removeReflectionFromGroups(state.groups, draggedId).map((group) => ({
        ...group,
        reflections: group.id === groupId
          ? [this.getReflectionById(draggedId), ...group.reflections].filter(Boolean)
          : group.reflections
      }));
      action('drop-card-on-group')(draggedId, groupId);
      return {
        dragging: {...state.dragging, [draggedId]: false},
        groups: newGroups
      };
    });
  };

  handleUngroup = (draggedId: ReflectionID) => {
    this.setState((state: DragAndDropStoryState) => {
      const newGroups = this.removeReflectionFromGroups(state.groups, draggedId);
      action('remove-card-from-group')(draggedId);
      return {
        groups: newGroups
      };
    });
  };

  removeReflectionFromGroups = (groups: Array<ReflectionGroupT>, reflectionId: ReflectionID): Array<ReflectionGroupT> => (
    groups
      .map((group) => ({
        ...group,
        reflections: group.reflections.filter((reflection) => reflection.id !== reflectionId)
      }))
      .filter((group) => group.reflections.length > 1)
  );

  render() {
    return (
      <RetroBackground>
        <StoryContainer
          description="Group reflection cards. Note: order of cards vs. groups on the canvas is not preserved in this demo."
          render={() => (
            <div>
              <ReflectionCatcher
                ungroupedReflections={this.getUngroupedReflections()}
                handleUngroup={this.handleUngroup}
              >
                <Grid>
                  {this.getUngroupedReflections().map((reflection) => (
                    <DraggableReflectionCard
                      contentState={reflection.content}
                      handleCancelDrag={this.handleCancelDrag}
                      handleBeginDrag={this.handleBeginDrag}
                      handleDrop={this.handleCardOnCardDrop}
                      id={reflection.id}
                      iAmDragging={this.state.dragging[reflection.id]}
                      key={reflection.id}
                      receiveDrops
                      userDragging={this.state.dragging[reflection.id] && 'Dan'}
                    />
                  ))}
                  {this.state.groups.map((group) => (
                    <DroppableReflectionGroup
                      id={group.id}
                      handleDrop={this.handleCardOnGroupDrop}
                      handleSaveTitle={action('save-title')}
                      reflections={group.reflections}
                      key={group.id}
                    />
                  ))}
                </Grid>
              </ReflectionCatcher>
              <ReflectionGroupingDragLayer getReflectionById={this.getReflectionById} />
            </div>
          )}
        />
      </RetroBackground>
    );
  }
}

storiesOf('Reflection Card Grouping', module)
  .add('drag and drop', () => (
    <DragAndDropStory />
  ));
