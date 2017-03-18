import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import {Avatar, Type} from 'universal/components';
import SummaryCard from 'universal/modules/meeting/components/SummaryCard/SummaryCard';

const UserSummary = (props) => {
  const {actions, picture, preferredName, projects, styles} = props;

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.userDetails)}>
        <Avatar hasBadge={false} picture={picture} size="large" />
        <Type align="center" marginBottom=".75rem" marginTop=".5rem" scale="s5">
          {preferredName}
        </Type>
        <span className={css(styles.userStat)}>
          <FontAwesome name="calendar" />{' '}
          {projects.length} New Projects
        </span>
        <span className={css(styles.userStat)}>
          <FontAwesome name="calendar-check-o" />{' '}
          {actions.length} New Actions
        </span>
      </div>
      <div className={css(styles.cardGroup)}>
        {[...projects, ...actions].map((outcome) =>
          <div className={css(styles.cardBlock)} key={`summary-card-${outcome.id}`}>
            <SummaryCard
              content={outcome.content}
              status={outcome.status}
            />
          </div>
        )}
      </div>
    </div>
  );
};

UserSummary.propTypes = {
  actions: PropTypes.array,
  picture: PropTypes.string,
  preferredName: PropTypes.string,
  projects: PropTypes.array,
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
