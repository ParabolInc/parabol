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

const reverse = <T>(arr: Array<T>): Array<T> => (
  arr.slice().reverse()
);

const ReflectionGroup = ({hoveredHeight, reflections}: Props) => (
  <ReflectionGroupWrapper>
    {hoveredHeight && <ReflectionCardDropPreview height={hoveredHeight} />}
    {reverse(reflections).map((reflection, index) => (
      <div
        className={css({
          position: 'absolute',
          top: `${(index + 1) / (reflections.length + 1)}rem`
        })}
        key={reflection.id}
      >
        <ReflectionCard
          contentState={reflection.content}
          hovered={Boolean(hoveredHeight)}
          id={reflection.id}
          stage={reflection.stage}
        />
      </div>
    ))}
  </ReflectionGroupWrapper>
);

export default ReflectionGroup;
