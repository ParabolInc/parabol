/**
 * Renders the dragging states of reflections during the grouping phase of the
 * retro meeting.
 *
 * @flow
 */
import type {Element} from 'react';
import type {Reflection, ReflectionID} from 'universal/types/retro';

import React, {Component} from 'react';
import {DragLayer} from 'react-dnd';
import styled, {css} from 'react-emotion';

import {REFLECTION_CARD} from 'universal/utils/constants';

import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import ui from 'universal/styles/ui';

type Item = { id: string };

type ItemType =
  | REFLECTION_CARD;

type Point = { x: number, y: number };

type DnDProps = {|
  currentOffset: ?Point,
  isDragging: boolean,
  item: Item,
  itemType: ItemType,
|};

type Props = {
  ...DnDProps,
  getReflectionById: (id: ReflectionID) => ?Reflection
};

const DragLayerWrapper = styled('div')({
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  zIndex: ui.ziCardDragLayer
});

class ReflectionGroupingDragLayer extends Component<Props> {
  position = (element: Element<*>) => {
    if (!this.props.currentOffset) {
      return null;
    }
    const {x, y} = this.props.currentOffset;
    const positionedStyles = css({
      transform: `translate3d(${x}px, ${y}px, 0px)`
    });
    return (
      <div className={positionedStyles}>
        {element}
      </div>
    );
  };

  renderItem = (itemType: ItemType, item: Item) => {
    const {getReflectionById} = this.props;
    const {id} = item;
    if (itemType === REFLECTION_CARD) {
      const reflection = getReflectionById(id);
      if (!reflection) {
        return null;
      }
      return this.position(
        <ReflectionCard
          contentState={reflection.content}
          id={id}
          pulled
          reflectionType={reflection.reflectionType}
        />
      );
    }
    return null;
  };

  render() {
    const {isDragging, item, itemType} = this.props;
    if (!isDragging) {
      return null;
    }
    return (
      <DragLayerWrapper>
        {this.renderItem(itemType, item)}
      </DragLayerWrapper>
    );
  }
}

const collect = (monitor): DnDProps => ({
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
  item: monitor.getItem(),
  itemType: monitor.getItemType()
});

export default DragLayer(collect)(ReflectionGroupingDragLayer);
