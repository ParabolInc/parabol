import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {ib} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import {Type} from 'universal/components';
import FontAwesome from 'react-fontawesome';

const iconStyle = {
  ...ib,
  color: theme.palette.mid,
  fontSize: ui.iconSize,
  marginRight: '.25rem',
  textAlign: 'center',
  width: '1rem'
};

const UserActionListEmpty = (props) => {
  const {styles} = UserActionListEmpty;
  const {onCreateNewAction} = props;
  return (
    <div className={styles.root}>
      <FontAwesome name="plus-circle" onClick={onCreateNewAction} style={iconStyle} />
      <Type bold display="inlineBlock" lineHeight="1.125rem" onClick={onCreateNewAction} scale="s3" width="auto">
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
    cursor: 'pointer',
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
