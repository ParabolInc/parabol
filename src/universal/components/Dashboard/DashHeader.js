import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

const DashHeader = (props) => {
  const {hasOverlay} = props;
  const rootStyles = hasOverlay ? combineStyles(styles.root, styles.hasOverlay) : styles.root;
  return (
    <div className={rootStyles}>
      {props.children}
    </div>
  );
};

DashHeader.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool
};

styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    display: 'flex',
    minHeight: '4.875rem',
    padding: '1rem',
    width: '100%'
  },

  hasOverlay: {
    filter: 'blur(1.5px)'
  }
});

export default look(DashHeader);
