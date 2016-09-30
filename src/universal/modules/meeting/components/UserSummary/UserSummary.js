import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
// import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import {Avatar, Type} from 'universal/components';
import SummaryCard from 'universal/modules/meeting/components/SummaryCard/SummaryCard';
import reduceForKeyValCount from 'universal/utils/reduceForKeyValCount';

const UserSummary = (props) => {
  const {styles} = UserSummary;
  const {avatar, name, outcomes} = props;

  return (
    <div className={styles.root}>
      <div className={styles.userDetails}>
        <Avatar hasBadge={false} picture={avatar} size="large" />
        <Type align="center" marginBottom=".75rem" marginTop=".5rem" scale="s5">
          {name}
        </Type>
        <span className={styles.userStat}>
          <FontAwesome name="calendar" />{' '}
          {reduceForKeyValCount(outcomes, 'type', 'project')} New Projects
        </span>
        <span className={styles.userStat}>
          <FontAwesome name="calendar-check-o" />{' '}
          {reduceForKeyValCount(outcomes, 'type', 'action')} New Actions
        </span>
      </div>
      <div className={styles.cardGroup}>
        {outcomes.map((outcome, idx) =>
          <div className={styles.cardBlock} key={`summary-card-${idx}`}>
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
  outcomes: PropTypes.array
};

UserSummary.styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  userDetails: {
    borderTop: `1px solid ${theme.palette.mid30l}`,
    margin: '1.5rem 0 0',
    padding: '1.5rem 0 .5rem',
    textAlign: 'center'
  },

  userStat: {
    color: theme.palette.dark,
    display: 'inline-block',
    fontSize: theme.typography.s3,
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

export default look(UserSummary);
