import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import Avatar from 'universal/components/Avatar/Avatar';

let s = {};

const DashboardAvatars = (props) => {
  const {teamMembers} = props;

  return (
    <div className={s.root}>
      {
        teamMembers.map((avatar, index) =>
          <div className={s.item} key={`dbAvatar${index}`}>
            <Avatar {...avatar} hasBadge={false} size="smaller" />
          </div>
        )
      }
    </div>
  );
};

DashboardAvatars.propTypes = {
  teamMembers: PropTypes.array
};

s = StyleSheet.create({
  root: {
    fontSize: 0,
    position: 'relative',
    textAlign: 'right',
    width: '100%'
  },

  item: {
    display: 'inline-block',
    margin: '0 .75rem',
    position: 'relative',
    verticalAlign: 'middle'
  }
});

export default look(DashboardAvatars);
