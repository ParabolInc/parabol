import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import {Avatar, Type} from 'universal/components';
import SummaryCard from 'universal/modules/meeting/components/SummaryCard/SummaryCard';
import reduceForKeyValCount from 'universal/utils/reduceForKeyValCount';

const UserSummary = (props) => {
  const {avatar, name, outcomes, styles} = props;

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.userDetails)}>
        <Avatar hasBadge={false} picture={avatar} size="large" />
        <Type align="center" marginBottom=".75rem" marginTop=".5rem" scale="s5">
          {name}
        </Type>
        <span className={css(styles.userStat)}>
          <FontAwesome name="calendar" />{' '}
          {reduceForKeyValCount(outcomes, 'type', 'project')} New Projects
        </span>
        <span className={css(styles.userStat)}>
          <FontAwesome name="calendar-check-o" />{' '}
          {reduceForKeyValCount(outcomes, 'type', 'action')} New Actions
        </span>
      </div>
      <div className={css(styles.cardGroup)}>
        {outcomes.map((outcome, idx) =>
          <div className={css(styles.cardBlock)} key={`summary-card-${idx}`}>
            <SummaryCard
              content={outcome.content}
              status={outcome.status}
              type={outcome.type}
            />
          </div>
        )}
      </div>
    </div>
  );
};

UserSummary.propTypes = {
  avatar: PropTypes.string,
  name: PropTypes.string,
  outcomes: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  userDetails: {
    borderTop: `1px solid ${appTheme.palette.mid30l}`,
    margin: '1.5rem 0 0',
    padding: '1.5rem 0 .5rem',
    textAlign: 'center'
  },

  userStat: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    margin: '0 .75rem',
    verticalAlign: 'middle'
  },

  cardGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '0 -.5rem',
    width: '100%'
  },

  cardBlock: {
    flex: '0 0 33.3333%',
    padding: '.5rem'
  }
});

export default withStyles(styleThunk)(UserSummary);
