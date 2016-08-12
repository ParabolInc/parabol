import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

let styles = {};

const DashModal = (props) => {
  const rootStyles = styles.root;
  return (
    <div className={rootStyles}>
      <div className={styles.modal}>
        {props.children}
      </div>
    </div>
  );
};

DashModal.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    background: 'rgba(255, 255, 255, .5)',
    bottom: 0,
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    left: '15rem',
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 0,
    zIndex: 400
  },

  modal: {
    background: '#fff',
    boxShadow: '0 0 0 .75rem rgba(9, 141, 143, .5)',
    padding: '2rem',
    width: '30rem'
  }
});

export default look(DashModal);
