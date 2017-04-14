import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Avatar from '../Avatar/Avatar';
import appTheme from 'universal/styles/theme/appTheme';

const MentionTeamMember = (props) => {
  const {active, picture, value, styles} = props;
  const itemStyle = css(
    styles.row,
    active && styles.active
  );
  return (
    <div className={itemStyle}>
      <Avatar hasBadge={false} picture={picture} size="smallest" />
      <div className={css(styles.name)}>
        {value}
      </div>
    </div>
  );
};

MentionTeamMember.propTypes = {
  active: PropTypes.bool,
  picture: PropTypes.string,
  styles: PropTypes.object,
  value: PropTypes.string,
};

const styleThunk = () => ({
  active: {
    background: appTheme.palette.cool
  },

  name: {
    marginLeft: '4px'
  },

  row: {
    cursor: 'pointer',
    display: 'flex',
    padding: '4px'
  }
});

export default withStyles(styleThunk)(MentionTeamMember);
