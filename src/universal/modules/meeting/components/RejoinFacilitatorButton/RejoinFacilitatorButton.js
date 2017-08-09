import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';

const RejoinFacilitatorButton = (props) => {
  const {styles, onClickHandler} = props;
  return (
    <div className={css(styles.rejoinButtonBlock)}>
      <Button
        colorPalette="warm"
        depth={2}
        icon="user"
        label="Rejoin Facilitator"
        onClick={onClickHandler}
        size="small"
      />
    </div>
  );
};

RejoinFacilitatorButton.propTypes = {
  styles: PropTypes.object,
  onClickHandler: PropTypes.func
};

const styleThunk = () => ({
  rejoinButtonBlock: {
    bottom: '2rem',
    position: 'fixed',
    right: '2rem'
  }
});

export default withStyles(styleThunk)(RejoinFacilitatorButton);
