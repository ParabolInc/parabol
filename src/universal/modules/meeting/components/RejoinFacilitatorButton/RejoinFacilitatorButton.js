import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';

const RejoinFacilitatorButton = (props) => {
  const {styles, onClickHandler} = props;
  return (
    <div
      className={css(styles.rejoinFacilitatorButton)}
      onClick={onClickHandler}
    >
      <FontAwesome
        name="user"
        className={css(styles.icon)}
      />
      Rejoin Facilitator
    </div>
  );
};

RejoinFacilitatorButton.propTypes = {
  styles: PropTypes.object,
  onClickHandler: PropTypes.func
};

const styleThunk = () => ({
  rejoinFacilitatorButton: {
    backgroundColor: appTheme.palette.warm,
    color: 'white',
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    padding: '12px',
    borderRadius: '4px',
    fontSize: appTheme.typography.s4,
    boxShadow: '2px 2px 2px rgba(0, 0, 0, .2)',
    cursor: 'pointer',
    ':hover': {
      opacity: '.65'
    }
  },
  icon: {
    color: 'white',
    marginRight: '10px',
  }
});

export default withStyles(styleThunk)(RejoinFacilitatorButton);
