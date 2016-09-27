import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {ib} from 'universal/styles/helpers';
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
  marginRight: '.25rem',
  textAlign: 'center',
  verticalAlignt: 'middle',
  width: '1rem'
};

const UserActionListEmpty = (props) => {
  const {styles} = UserActionListEmpty;
  const {onCreateNewAction} = props;
  return (
    <div className={styles.root}>
      <FontAwesome name="plus-circle" onClick={onCreateNewAction} style={iconStyle} />
      <Type bold display="inlineBlock" lineHeight={lineHeight} onClick={onCreateNewAction} scale="s3" width="auto">
        Add New Action
      </Type>
    </div>
  );
};

UserActionListEmpty.propTypes = {
  onCreateNewAction: PropTypes.func
};

UserActionListEmpty.styles = StyleSheet.create({
  root: {
    backgroundColor: ui.actionCardBgColor,
    boxSizing: 'content-box',
    cursor: 'pointer',
    fontSize: 0,
    height,
    lineHeight,
    padding: '.25rem .4375rem',

    ':hover': {
      backgroundColor: ui.actionCardBgActive
    },
    ':focus': {
      backgroundColor: ui.actionCardBgActive
    }
  }
});

export default look(UserActionListEmpty);
