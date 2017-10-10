import PropTypes from 'prop-types';
import React from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import portal from 'react-portal-hoc';
import Avatar from 'universal/components/Avatar/Avatar';
import Button from 'universal/components/Button/Button';

const PhotoUploadModal = (props) => {
  const {
    children,
    closeAfter,
    closePortal,
    isClosing,
    picture,
    styles,
    unstyled
  } = props;
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold scale="s6" colorPalette="mid">
        Upload a New Photo
      </Type>
      <div className={css(styles.avatarBlock)}>
        <Avatar picture={picture} size="fill" sansRadius={unstyled} sansShadow={unstyled} />
      </div>
      {children}
      <div className={css(styles.done)}>
        <Button
          colorPalette="cool"
          icon="check-circle"
          iconPlacement="right"
          label="Done"
          onClick={closePortal}
          buttonSize="medium"
          buttonStyle="flat"
        />
      </div>
    </DashModal>
  );
};

PhotoUploadModal.propTypes = {
  children: PropTypes.any,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  picture: PropTypes.string,
  styles: PropTypes.object,
  unstyled: PropTypes.bool
};

const styleThunk = () => ({
  done: {
    textAlign: 'right',
    width: '100%'
  },

  avatarBlock: {
    display: 'block',
    margin: '1.5rem auto',
    width: '6rem'
  }
});

export default portal({escToClose: true, closeAfter: 100})(
  withStyles(styleThunk)(PhotoUploadModal)
);
