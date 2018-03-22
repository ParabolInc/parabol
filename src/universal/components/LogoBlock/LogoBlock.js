import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import logoMarkPrimary from 'universal/styles/theme/images/brand/mark-primary.svg';
import logoMarkWhite from 'universal/styles/theme/images/brand/mark-white.svg';

const RootBlock = styled('div')(({variant}) => ({
  alignItems: 'center',
  borderTop: variant === 'primary' && `.0625rem solid ${appTheme.palette.mid10a}`,
  boxSizing: 'content-box',
  display: 'flex',
  height: ui.meetingControlBarHeight,
  justifyContent: 'center',
  width: '100%'
}));

const Anchor = styled('a')({
  display: 'block'
});

const Image = styled('img')({
  display: 'block'
});

const LogoBlock = (props) => {
  const {variant} = props;
  const logoSrc = variant === 'primary' ? logoMarkPrimary : logoMarkWhite;
  return (
    <RootBlock variant={variant}>
      <Anchor href="http://www.parabol.co/" rel="noopener noreferrer" title="Parabol" target="_blank">
        <Image alt="Parabol" src={logoSrc} />
      </Anchor>
    </RootBlock>
  );
};

LogoBlock.propTypes = {
  variant: PropTypes.oneOf([
    'primary',
    'white'
  ])
};

export default LogoBlock;
