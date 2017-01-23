import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import brandMark from 'universal/styles/theme/images/brand/mark-color.svg';
import IconLink from 'universal/components/IconLink/IconLink';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const PhotoUploadModal = (props) => {
  const {children, picture, onBackdropClick, styles} = props;
  return (
    <DashModal onBackdropClick={onBackdropClick}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Upload a new photo
      </Type>
      <img height={96} width={96} src={picture || brandMark}/>
      {children}
      <div className={css(styles.done)}>
        <IconLink
          colorPalette="cool"
          icon="arrow-circle-right"
          iconPlacement="right"
          label="Done"
          margin="1.5rem 0 0 0"
          onClick={onBackdropClick}
          scale="large"
        />
      </div>
    </DashModal>
  );
};

PhotoUploadModal.propTypes = {
  onBackdropClick: PropTypes.func,
};

const styleThunk = () => ({
  done: {
    textAlign: 'right',
    width: '100%'
  }
});

export default withStyles(styleThunk)(PhotoUploadModal);
