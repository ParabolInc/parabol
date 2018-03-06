/**
 * The container block for reflection cards.
 *
 * @flow
 */

import React from 'react';
import {css} from 'react-emotion';

import appTheme from 'universal/styles/theme/appTheme';
import without from 'universal/utils/without';

type Props = {
  // true when the card is being dragged, and rendering the placeholder of the original location
  holdingPlace?: boolean,
  // true when this is being hovered over by another card
  hoveringOver?: boolean,
  // true when this is being pulled under the mouse
  pulled?: boolean
}

const ReflectionCardWrapper = (props: Props) => {
  const borderRadius = 3;
  const passedOnProps = without(props, 'holdingPlace', 'hoveringOver', 'pulled');
  const styles = {
    backgroundColor: props.hoveringOver ? '#f8f7fa' : '#FFF',
    borderRadius,
    boxShadow: props.pulled
      ? '0 2px 4px 2px rgba(0, 0, 0, .2)'
      : '0 0 1px 1px rgba(0, 0, 0, .1)',
    color: appTheme.palette.dark,
    minHeight: '1rem',
    position: 'relative',
    width: '20rem'
  };

  return props.holdingPlace ? (
    <div aria-label="Retrospective reflection" className={css(styles)}>
      <div
        className={css({borderRadius, boxShadow: `0 0 0 1px ${appTheme.palette.warm}`})}
        {...passedOnProps}
      />
    </div>
  ) : (
    <div aria-label="Retrospective reflection" className={css(styles)} {...passedOnProps} />
  );
};

export default ReflectionCardWrapper;
