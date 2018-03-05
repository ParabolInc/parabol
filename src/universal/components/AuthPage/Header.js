/**
 * The brand header for the authentication homepages.
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';
import {Link} from 'react-router-dom';

import appTheme from 'universal/styles/theme/appTheme';
import parabolLogo from 'universal/styles/theme/images/brand/logo.svg';

const HeaderContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  backgroundColor: appTheme.brand.new.purple,
  color: 'white',
  fontFamily: appTheme.typography.sansSerif
});

const HeaderBrand = styled('div')({
  padding: '0.8rem 1rem 0.6rem'
});

export default () => (
  <HeaderContainer>
    <HeaderBrand>
      <Link to="/" title="Parabol Home">
        <img src={parabolLogo} alt="" />
      </Link>
    </HeaderBrand>
  </HeaderContainer>
);
