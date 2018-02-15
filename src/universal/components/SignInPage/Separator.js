/**
 * A horizontal separator; looks like:
 *  ---------- some text ----------
 *
 * @flow
 */

import React from 'react';

import appTheme from 'universal/styles/theme/appTheme';

const separatorStyles = {
  padding: '1rem 0 1rem 0',
  display: 'flex',
  flexDirection: 'row'
};

const separatorLineStyles = {
  margin: 'auto',
  width: '10rem',
  borderBottom: `1px solid ${appTheme.palette.mid}`
};

const separatorLineLeftStyles = {
  ...separatorLineStyles,
  marginRight: '0.5rem'
};

const separatorLineRightStyles = {
  ...separatorLineStyles,
  marginLeft: '0.5rem'
};

type Props = {
  text: string
};

export default ({text}: Props) => (
  <div style={separatorStyles}>
    <div style={separatorLineLeftStyles} />
    {text}
    <div style={separatorLineRightStyles} />
  </div>
);
