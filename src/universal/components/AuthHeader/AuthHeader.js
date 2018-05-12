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

const H1 = styled('h1')({
  color: appTheme.palette.dark,
  fontFamily: appTheme.typography.serif,
  margin: '3rem 0 .5rem',
  textAlign: 'center'
});

const H2 = styled('h2')({
  color: appTheme.palette.mid,
  fontSize: '1rem',
  fontWeight: 400,
  margin: '.5rem 0 2rem',
  textAlign: 'center'
});

const linkStyles = {
  color: appTheme.palette.mid,
  textDecoration: 'underline'
};

const brandStyledLink = (tag: Tag): StyledComponent<*> =>
  styled(tag)({
    ...linkStyles,
    ':hover': linkStyles,
    ':focus': linkStyles
  });

const BrandedLink = brandStyledLink(Link);

const AuthHeader = (props: Props) => (
  <Fragment>
    <H1>{props.heading}</H1>
    <H2>
      {'or '}
      <BrandedLink to={props.secondaryAction.relativeUrl}>
        {props.secondaryAction.displayName}
      </BrandedLink>
    </H2>
  </Fragment>
);

export default AuthHeader;
