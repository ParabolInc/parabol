/**
 * The container block for reflection cards.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';

import appTheme from 'universal/styles/theme/appTheme';

type Props = {
  pulled?: boolean
}

const ReflectionCardWrapper = styled(
  (props) => <div aria-label="Retrospective reflection" {...props} />
)(({pulled}: Props) => ({
  backgroundColor: '#FFF',
  borderRadius: 3,
  boxShadow: pulled
    ? '0 2px 4px 2px rgba(0, 0, 0, .2)'
    : '0 0 1px 1px rgba(0, 0, 0, .1)',
  color: appTheme.palette.dark,
  minHeight: '1rem',
  position: 'relative',
  width: '20rem'
}));

export default ReflectionCardWrapper;
