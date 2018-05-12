import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const RootBlock = styled('div')(({hasOverlay}) => ({
  alignItems: 'center',
  backgroundColor: '#fff',
  borderBottom: `1px solid ${ui.dashBorderColor}`,
  display: 'flex',
  filter: hasOverlay && ui.filterBlur,
  width: '100%'
}));

const InnerBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 auto',
  minHeight: ui.dashHeaderMinHeight,
  padding: `0 ${ui.dashGutterSmall}`,
  width: '100%',

  [ui.dashBreakpoint]: {
    padding: `0 ${ui.dashGutterLarge}`
  }
});

const DashHeader = (props) => {
  const {children, hasOverlay} = props;
  return (
    <RootBlock hasOverlay={hasOverlay}>
      <InnerBlock>{children}</InnerBlock>
    </RootBlock>
  );
};

DashHeader.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool
};

export default DashHeader;
