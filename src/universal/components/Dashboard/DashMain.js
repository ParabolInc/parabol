import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';


const combineStyles = StyleSheet.combineStyles;

let styles = {};

const DashMain = (props) => {
  const {hasOverlay} = props;
  const rootStyles = hasOverlay ? combineStyles(styles.root, styles.hasOverlay) : styles.root;
  return (
    <div className={rootStyles}>
      {props.children}
    </div>
  );
};

DashMain.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool
};

styles = StyleSheet.create({
  root: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column'
  },

  hasOverlay: {
    filter: 'blur(1.5px)'
  }
});

export default look(DashMain);
