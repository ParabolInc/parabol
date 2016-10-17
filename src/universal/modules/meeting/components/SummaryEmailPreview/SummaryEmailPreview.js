import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import UserSummary from 'universal/modules/meeting/components/UserSummary/UserSummary';
import {Type} from 'universal/components';
import FontAwesome from 'react-fontawesome';

const iconStyle = {
  color: appTheme.palette.dark,
  display: 'block',
  fontSize: ui.iconSize2x,
  height: ui.iconSize2x,
  lineHeight: ui.iconSize2x,
  margin: '0 0 .5rem',
  textAlign: 'center'
};

const SummaryEmailPreview = (props) => {
  const {styles, teamMembers} = props;
  return (
    <div className={css(styles.root)}>
      <FontAwesome name="envelope-o" style={iconStyle} />
      <Type align="center" bold family="serif" scale="sBase">
        An email summary will be mailed to all team members:
      </Type>
      {teamMembers.map((teamMember) =>
        <UserSummary
          actions={teamMember.actions}
          key={`teamMember-summary-${teamMember.id}`}
          picture={teamMember.picture}
          preferredName={teamMember.preferredName}
          projects={teamMember.projects}
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
