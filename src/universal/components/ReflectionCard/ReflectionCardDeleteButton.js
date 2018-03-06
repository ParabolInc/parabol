/**
 * Renders the delete button for a retro card, which floats in the top-right
 * corner of the card.
 *
 * @flow
 */
import React from 'react';
import {css} from 'react-emotion';
import FontAwesome from 'react-fontawesome';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import appTheme from 'universal/styles/theme/appTheme';

type DeleteButtonProps = {
  innerRef: (?HTMLButtonElement) => any,
  isVisible: boolean,
  onBlur: () => any,
  onClick: () => any,
  onFocus: () => any
};

const deleteButtonStyles = {
  backgroundColor: 'rgba(1, 1, 1, 0)',
  color: appTheme.palette.warm,
  padding: '0.1rem',
  position: 'absolute',
  right: '-.6rem',
  top: '-.6rem'
};

const DeleteButton = (props: DeleteButtonProps) => (
  <PlainButton
    className={css(deleteButtonStyles)}
    aria-label="Delete this reflection card"
    onBlur={props.onBlur}
    onClick={props.onClick}
    onFocus={props.onFocus}
    ref={props.innerRef}
  >
    {props.isVisible && <FontAwesome name="times-circle" />}
  </PlainButton>
);

export default DeleteButton;
