import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import UserSummary from 'universal/modules/meeting/components/UserSummary/UserSummary';

const SummaryEmailPreview = (props) => {
  const {styles, teamOutcomes} = props;

  return (
    <div className={css(styles.root)}>
      {teamOutcomes.map((user, idx) =>
        <UserSummary
          avatar={user.avatar}
          key={`user-summary-${idx}`}
          name={user.name}
          outcomes={user.outcomes}
        />
      )}
      <div className={css(styles.fin)}>fin</div>
    </div>
  );
};

SummaryEmailPreview.propTypes = {
  styles: PropTypes.object,
  teamOutcomes: PropTypes.array
};

const styleThunk = () => ({
  root: {
    backgroundColor: ui.emailBackgroundColor,
    border: `1px solid ${appTheme.palette.mid30l}`,
    margin: '0 auto',
    maxWidth: '37.5rem',
    padding: '1.5rem',
    width: '100%'
  },

  fin: {
    color: appTheme.palette.mid50l,
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    marginTop: '1.5rem',
    textAlign: 'center'
  }
});

export default withStyles(styleThunk)(SummaryEmailPreview);
