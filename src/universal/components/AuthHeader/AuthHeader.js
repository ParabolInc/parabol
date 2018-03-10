/**
 * Renders the top section of an auth page (such as sign in or sign up).
 *
 * @flow
 */
import type {StyledComponent, Tag} from 'react-emotion';

import React, {Fragment} from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';

import appTheme from 'universal/styles/theme/appTheme';

type Props = {
  heading: string,
  secondaryAction: {
    displayName: string,
    relativeUrl: string
  }
};

const purple = {
  color: appTheme.brand.new.purple
};

const H1 = styled('h1')(purple);

const H2 = styled('h2')({
  ...purple,
  fontSize: '1.2rem'
});

const linkStyles = {
  ...purple,
  textDecoration: 'underline'
};

const brandStyledLink = (tag: Tag): StyledComponent<*> => (
  styled(tag)({
    ...linkStyles,
    ':hover': linkStyles,
    ':focus': linkStyles
  })
);

const BrandedLink = brandStyledLink(Link);

const AuthHeader = (props: Props) => (
  <Fragment>
    <H1>{props.heading}</H1>
    <H2>
      or{' '}
      <BrandedLink to={props.secondaryAction.relativeUrl}>
        {props.secondaryAction.displayName}
      </BrandedLink>
    </H2>
  </Fragment>
);

export default AuthHeader;
