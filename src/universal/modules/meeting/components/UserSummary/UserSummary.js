import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import {Avatar, Type} from 'universal/components';
import SummaryCard from 'universal/modules/meeting/components/SummaryCard/SummaryCard';

const UserSummary = (props) => {
  const {picture, preferredName, tasks, styles} = props;

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.userDetails)}>
        <Avatar hasBadge={false} picture={picture} size="large" />
        <Type align="center" marginBottom=".75rem" marginTop=".5rem" scale="s5">
          {preferredName}
        </Type>
        <span className={css(styles.userStat)}>
          <FontAwesome name="calendar" />{' '}
          {tasks.length} New Tasks
        </span>
      </div>
      <div className={css(styles.cardGroup)}>
        {tasks.map((task) =>
          (<div className={css(styles.cardBlock)} key={`summary-card-${task.id}`}>
            <SummaryCard
              content={task.content}
              status={task.status}
              tags={task.tags}
            />
          </div>)
        )}
      </div>
    </div>
  );
};

UserSummary.propTypes = {
  picture: PropTypes.string,
  preferredName: PropTypes.string,
  tasks: PropTypes.array,
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
