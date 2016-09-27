import React from 'react';
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

const UserActionListEmpty = () => {
  const {styles} = UserActionListEmpty;
  return (
    <div className={styles.root}>
      <FontAwesome className={styles.hintIcon} name="lightbulb-o" style={iconStyle} />
      <div style={{overflow: 'hidden'}}>
        <Type family="serif" italic lineHeight="1.25rem" scale="s2">
          Actions are smaller tasks not tracked on the team dashboard;{' '}
          only you can see them after they are created.{' '}
          They are great for things you can complete in under a day or two.
        </Type>
      </div>
    </div>
  );
};

UserActionListEmpty.styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${ui.cardBorderColor}`,
    padding: '.5rem .875rem .5rem .4375rem'
  },

  hintIcon: {
    float: 'left'
  }
});

export default look(UserActionListEmpty);
