import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {Type} from 'universal/components';
import FontAwesome from 'react-fontawesome';

const rootStyle = {
  borderTop: `1px solid ${ui.cardBorderColor}`,
  padding: '.5rem .875rem .5rem .4375rem'
};

const iconStyle = {
  display: 'inline-block',
  color: appTheme.palette.mid,
  float: 'left',
  fontSize: ui.iconSize,
  marginRight: '.3125rem',
  textAlign: 'center',
  verticalAlign: 'middle',
  width: '1rem'
};

const UserActionListEmpty = () =>
  <div style={rootStyle}>
    <FontAwesome name="lightbulb-o" style={iconStyle} />
    <div style={{overflow: 'hidden'}}>
      <Type family="serif" italic lineHeight="1.25rem" scale="s2">
        Actions are smaller tasks not tracked on the team dashboard;{' '}
        only you can see them after they are created.{' '}
        They are great for things you can complete in under a day or two.
      </Type>
    </div>
  </div>;

export default UserActionListEmpty;
