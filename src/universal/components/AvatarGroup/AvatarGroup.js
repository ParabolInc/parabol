import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import Avatar from '../Avatar/Avatar';
import {CHECKIN, UPDATES} from 'universal/utils/constants';

let s = {};

const AvatarGroup = (props) => {
  const {localPhase, avatars} = props;
  let label;
  if (localPhase === CHECKIN) {
    label = 'Team:';
  } else if (localPhase === UPDATES) {
    label = 'Updates given:';
  } else {
    label = '';
  }

  return (
    <div className={s.root}>
      <div className={s.label}>
        {label}
      </div>
      {
        avatars.map((avatar, index) =>
          <div className={s.item} key={index}>
            <Avatar {...avatar} size="small" hasBorder={avatar.isFacilitator} />
          </div>
        )
      }
    </div>
  );
};

AvatarGroup.propTypes = {
  label: PropTypes.string,
  avatars: PropTypes.array
};

s = StyleSheet.create({
  root: {
    textAlign: 'center'
  },

  label: {
    color: theme.palette.mid,
    display: 'inline-block',
    fontFamily: theme.typography.serif,
    fontStyle: 'italic',
    fontWeight: 700,
    height: '2.75rem',
    lineHeight: '2.75rem',
    margin: '0 .75rem',
    verticalAlign: 'middle'
  },

  item: {
    display: 'inline-block',
    margin: '0 .75rem',
    position: 'relative',
    verticalAlign: 'middle'
  }
});

export default look(AvatarGroup);
