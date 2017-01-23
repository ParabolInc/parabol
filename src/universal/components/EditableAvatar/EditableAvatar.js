import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import brandMark from 'universal/styles/theme/images/brand/mark-color.svg';
import FontAwesome from 'react-fontawesome';

const EditableAvatar = (props) => {
  const {styles, onClick, picture} = props;
  return (
    <div className={css(styles.avatar)}>
      <div className={css(styles.avatarEditOverlay)} onClick={onClick}>
        <FontAwesome name="pencil"/>
        <span>EDIT</span>
      </div>
      <img className={css(styles.avatarImg)} height={96} width={96} src={picture || brandMark}/>
    </div>
  )
};

const styleThunk = (theme, {borderRadius}) => ({
  avatar: {
    height: 104,
    paddingTop: 8,
    position: 'relative',
    width: 96
  },

  avatarEditOverlay: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.dark,
    borderRadius,
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    height: 96,
    justifyContent: 'center',
    opacity: 0,
    position: 'absolute',
    width: 96,

    ':hover': {
      opacity: '.75',
      transition: 'opacity .2s ease-in',
    },
  },

  avatarImg: {
    borderRadius
  }
});

export default withStyles(styleThunk)(EditableAvatar);
