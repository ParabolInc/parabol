/**
 * A message container used to alert the user to an error.
 * Looks something like:
 *   [ (!) Your Message Here ]
 *
 * @flow
 */
import React from 'react';
import tinycolor from 'tinycolor2';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

type Props = {
  message: string
};

const backgroundColor = tinycolor(ui.colorError).setAlpha(0.2).toRgbString();

const ErrorAlertWrapper = styled('div')({
  backgroundColor,
  borderRadius: ui.borderRadiusSmall,
  fontSize: appTheme.typography.s3,
  marginBottom: '1rem',
  padding: '.5rem 1rem'
});

const SpacedIcon = styled(FontAwesome)({
  fontSize: ui.iconSize,
  marginRight: '.5rem'
});

const ErrorAlert = ({message}: Props) => {
  return (
    <ErrorAlertWrapper role="alert">
      <SpacedIcon name="exclamation-circle" />
      <span>{message}</span>
    </ErrorAlertWrapper>
  );
};

export default ErrorAlert;
