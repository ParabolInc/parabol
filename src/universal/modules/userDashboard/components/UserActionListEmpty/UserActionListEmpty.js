import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {cardBorderTop, ib} from 'universal/styles/helpers';
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

const padding = '.5rem';

const UserActionListEmpty = (props) => {
  const {styles} = UserActionListEmpty;
  const {onCreateNewAction} = props;
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <FontAwesome name="plus-circle" onClick={onCreateNewAction} style={iconStyle} />
        <Type bold display="inlineBlock" lineHeight="1.125rem" onClick={onCreateNewAction} scale="s3" width="auto">
          Add New Action
        </Type>
      </div>
      <div className={styles.body}>
        <FontAwesome className={styles.hintIcon} name="lightbulb-o" style={iconStyle} />
        <div style={{overflow: 'hidden'}}>
          <Type family="serif" italic lineHeight="1.25rem" scale="s2">
            Actions are smaller tasks not tracked on the team dashboard;{' '}
            only you can see them after they are created.{' '}
            They are great for things you can complete in under a day or two.
          </Type>
        </div>
      </div>
    </div>
  );
};

UserActionListEmpty.propTypes = {
  onCreateNewAction: PropTypes.function
};

UserActionListEmpty.styles = StyleSheet.create({
  root: {
    backgroundColor: ui.actionCardBgColor,
    borderColor: ui.cardBorderColor,
    borderRadius: ui.cardBorderRadius,
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingTop: '.1875rem',
    position: 'relative',

    '::after': {
      ...cardBorderTop
    }
  },

  header: {
    borderBottom: `1px solid ${ui.cardBorderColor}`,
    padding: `.25rem ${padding}`
  },

  body: {
    padding
  },

  hintIcon: {
    float: 'left'
  }
});

export default look(UserActionListEmpty);
