import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import {ib} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import {Type} from 'universal/components';
import FontAwesome from 'react-fontawesome';

const height = '1.25rem';
const lineHeight = height;
const iconStyle = {
  ...ib,
  color: appTheme.palette.mid,
  fontSize: ui.iconSize,
  height,
  lineHeight,
  marginRight: '.3125rem',
  textAlign: 'center',
  verticalAlign: 'middle',
  width: '1rem'
};

const UserActionListEmpty = (props) => {
  const {onAddNewAction, styles} = props;
  return (
    <div className={css(styles.root)} onClick={onAddNewAction}>
      <FontAwesome name="plus-circle" style={iconStyle} />
      <Type bold display="inlineBlock" lineHeight={lineHeight} scale="s3" width="auto">
        Add New Action
      </Type>
    </div>
  );
};

UserActionListEmpty.propTypes = {
  onAddNewAction: PropTypes.func
};

const styleThunk = () => ({
  root: {
    boxSizing: 'content-box',
    cursor: 'pointer',
    fontSize: 0,
    height,
    lineHeight,
    padding: '.25rem .4375rem .25rem',

    ':hover': {
      backgroundColor: ui.actionCardBgActive
    },
    ':focus': {
      backgroundColor: ui.actionCardBgActive
    }
  }
});

export default withStyles(styleThunk)(UserActionListEmpty);
