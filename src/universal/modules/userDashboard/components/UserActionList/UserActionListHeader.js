import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {cardBorderTop, ib} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import {Type} from 'universal/components';
import FontAwesome from 'react-fontawesome';

const height = '1.25rem';
const lineHeight = height;

const iconStyle = {
  ...ib,
  color: theme.palette.mid,
  fontSize: ui.iconSize,
  height,
  lineHeight,
  marginRight: '.3125rem',
  textAlign: 'center',
  verticalAlign: 'middle',
  width: '1rem'
};

const UserActionListEmpty = (props) => {
  const {styles} = UserActionListEmpty;
  const {onAddNewAction} = props;
  return (
    <div className={styles.root} onClick={onAddNewAction}>
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

UserActionListEmpty.styles = StyleSheet.create({
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

export default look(UserActionListEmpty);
