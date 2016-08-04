import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
// import theme from 'universal/styles/theme';
import Avatar from 'universal/components/Avatar/Avatar';

let s = {};
const outerPadding = '8rem';

const DashboardAvatars = (props) => {
  const {teamMembers} = props;

  return (
    <div className={s.root}>
      {
        teamMembers.map((avatar, index) =>
          <div className={s.item} key={`dbAvatar${index}`}>
            <Avatar {...avatar} size="small" />
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
    padding: `0 ${outerPadding}`,
    position: 'relative',
    textAlign: 'center'
  },

  item: {
    display: 'inline-block',
    margin: '0 .75rem',
    position: 'relative',
    verticalAlign: 'middle'
  }
});

export default look(DashboardAvatars);
