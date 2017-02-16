import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import IconLink from 'universal/components/IconLink/IconLink';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import portal from 'react-portal-hoc';

const PhotoUploadModal = (props) => {
  const {
    children,
    closeAfter,
    closePortal,
    isClosing,
    picture,
    styles
  } = props;
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Upload a new photo
      </Type>
      <img height={96} width={96} src={picture}/>
      {children}
      <div className={css(styles.done)}>
        <IconLink
          colorPalette="cool"
          icon="arrow-circle-right"
          iconPlacement="right"
          label="Done"
          margin="1.5rem 0 0 0"
          onClick={closePortal}
          scale="large"
        />
      </div>
    </DashModal>
  );
};

PhotoUploadModal.propTypes = {
  picture: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  done: {
    textAlign: 'right',
    width: '100%'
  }
});

export default portal({escToClose: true, closeAfter: 100})(
  withStyles(styleThunk)(PhotoUploadModal)
);
