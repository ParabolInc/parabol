/**
 * Displays a group of reflection cards that have been purposefully grouped together.
 *
 * @flow
 */
import type {Reflection} from 'universal/types/retro';

import React from 'react';
import styled, {css} from 'react-emotion';

import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';

type Props = {
  reflections: Array<Reflection>,
  hoveredHeight?: number
};

const ReflectionGroupWrapper = styled('div')({
  position: 'relative'
});

const ReflectionGroup = ({hoveredHeight, reflections}: Props) => {
  const isHovering = Boolean(hoveredHeight);
  const filteredSet = reflections.slice(0, 5);
  return (
    <ReflectionGroupWrapper>
      {hoveredHeight &&
        <div
          className={css({
            position: 'absolute',
            transform: `scale(${1 - (0.05 * (filteredSet.length))})`
          })}
        >
          <ReflectionCardDropPreview height={hoveredHeight} />
        </div>
      }
      {filteredSet.map((reflection, index) => (
        <div
          className={css({
            position: 'absolute',
            transform: `scale(${1 - (0.05 * (filteredSet.length - index - 1))})`,
            top: `${((index + (isHovering ? 1 : 0)) / (filteredSet.length + (isHovering ? 1 : 0))) * 1.5}rem`
          })}
          key={reflection.id}
        >
          <ReflectionCard
            contentState={reflection.content}
            hovered={isHovering}
            id={reflection.id}
            stage={reflection.stage}
          />
        </div>
      ))}
    </ReflectionGroupWrapper>
  );
};

export default ReflectionGroup;
