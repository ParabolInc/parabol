import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import UserSummary from 'universal/modules/meeting/components/UserSummary/UserSummary';

const SummaryEmailPreview = (props) => {
  const {styles} = SummaryEmailPreview;
  const {teamOutcomes} = props;

  return (
    <div className={styles.root}>
      {teamOutcomes.map((user, idx) =>
        <UserSummary
          avatar={user.avatar}
          key={`user-summary-${idx}`}
          name={user.name}
          outcomes={user.outcomes}
        />
      )}
      <div className={styles.fin}>fin</div>
    </div>
  );
};

SummaryEmailPreview.propTypes = {
  teamOutcomes: PropTypes.array
};

SummaryEmailPreview.styles = StyleSheet.create({
  root: {
    backgroundColor: ui.emailBackgroundColor,
    border: `1px solid ${theme.palette.mid30l}`,
    margin: '0 auto',
    maxWidth: '37.5rem',
    padding: '1.5rem',
    width: '100%'
  },

  fin: {
    color: theme.palette.mid50l,
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    marginTop: '1.5rem',
    textAlign: 'center'
  }
});

export default look(SummaryEmailPreview);
