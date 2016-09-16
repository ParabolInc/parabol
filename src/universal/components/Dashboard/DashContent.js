import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';

const backgroundColor = tinycolor.mix(theme.palette.mid10l, '#fff', 50).toHexString();
const combineStyles = StyleSheet.combineStyles;
let styles = {};

const DashContent = (props) => {
  const {children, hasOverlay, padding} = props;
  const style = {padding};
  const rootStyles = hasOverlay ? combineStyles(styles.root, styles.hasOverlay) : styles.root;
  return (
    <div className={rootStyles} style={style}>
      {children}
    </div>
  );
};

DashContent.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool,
  padding: PropTypes.string
};

DashContent.defaultProps = {
  padding: '1rem'
};

styles = StyleSheet.create({
  root: {
    backgroundColor,
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  hasOverlay: {
    filter: 'blur(1.5px)'
  }
});

export default look(DashContent);
