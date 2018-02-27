/**
 * A message container used to alert the user to an error.
 * Looks something like:
 *   [ (!) Your Message Here ]
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';

import appTheme from 'universal/styles/theme/appTheme';

const ErrorAlertWrapper = styled('div')({
  padding: '0.5rem 1rem',
  backgroundColor: appTheme.palette.warm20a,
  marginBottom: '1rem'
});

const SpacedIcon = styled(FontAwesome)({
  marginRight: '1rem'
});

const ErrorAlert = ({message}: {message: string}) => {
  return (
    <ErrorAlertWrapper role="alert">
      <SpacedIcon name="exclamation-circle" />
      <span>{message}</span>
    </ErrorAlertWrapper>
  );
};

export default ErrorAlert;
