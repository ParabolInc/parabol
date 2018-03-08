import PropTypes from 'prop-types';
import React from 'react';;
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import logoMarkPrimary from 'universal/styles/theme/images/brand/mark-primary.svg';
import logoMarkWhite from 'universal/styles/theme/images/brand/mark-white.svg';

const Block = styled('div')(({theme}) => ({
  alignItems: 'center',
  borderTop: theme === 'primary' && `.0625rem solid ${appTheme.palette.mid10a}`,
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
  const {theme} = props;
  const logoSrc = theme === 'primary' ? logoMarkPrimary : logoMarkWhite;
  return (
    <Block>
      <Anchor href="http://www.parabol.co/" rel="noopener noreferrer" title="Parabol" target="_blank">
        <Image alt="Parabol" src={logoSrc} />
      </Anchor>
    </Block>
  );
};

LogoBlock.propTypes = {
  theme: PropTypes.oneOf([
    'primary',
    'white'
  ])
};

export default LogoBlock;
