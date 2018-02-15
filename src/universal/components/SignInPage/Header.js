/**
 * The brand header for the authentication homepages.
 *
 * @flow
 */
import React from 'react';
import {Link} from 'react-router-dom';

import appTheme from 'universal/styles/theme/appTheme';
import parabolLogo from 'universal/styles/theme/images/brand/parabol-beta-lockup.svg';


const headerStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: '4rem',
  width: '100%',
  backgroundColor: appTheme.brand.greyBlue,
  color: 'white',
  fontFamily: appTheme.typography.sansSerif
};

const headerBrandStyles = {
  paddingLeft: '1rem'
};

export default () => (
  <div style={headerStyles}>
    <div style={headerBrandStyles}>
      <Link to="/" title="Parabol Home">
        <img src={parabolLogo} alt="" />
      </Link>
    </div>
  </div>
);
