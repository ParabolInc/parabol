import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import {PERSONAL_LABEL, PRO_LABEL} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';

const linkLabel = 'Compare Plans';
const linkURL = '#account-features'; // TODO: Link to new pricing page (TA)
const iconStyles = {
  fontSize: ui.iconSize,
  marginLeft: '.125rem'
};

// TODO needs a design for non-billing leaders
const TeamArchiveSqueeze = (props) => {
  const {isBillingLeader, orgId, projectsAvailableCount, styles, viewer} = props;
  const unavailableProjects = viewer.archivedProjectsCount - projectsAvailableCount;

  const handleUpgrade = () => {
    history.push(`/me/organizations/${orgId}`);
  };
  return (
    <div className={css(styles.archiveSqueezeOuter)}>
      <Panel bgTheme="light" depth={0} hasHeader={false}>
        <div className={css(styles.archiveSqueezeInner)}>
          <div className={css(styles.archiveSqueezeContent)}>
            <h2 className={css(styles.archiveSqueezeHeading)}>
              {`${unavailableProjects} Cards Unavailable!`}
            </h2>
            <p className={css(styles.archiveSqueezeCopy)}>
              {'With the '}<b>{`${PERSONAL_LABEL} Plan`}</b>{' you can access archived cards for '}<b>{'14 days'}</b>{'.'}<br />
              {'For full access to your team’s archive, upgrade to the '}<b>{`${PRO_LABEL} Plan`}</b>{'.'}<br />
              <a href={linkURL} target="_blank" title={linkLabel}>
                <b>{linkLabel}</b> <FontAwesome name="external-link-square" style={iconStyles} />
              </a>
            </p>
          </div>
          <div className={css(styles.archiveSqueezeButtonBlock)}>
            {isBillingLeader ?
              <Button
                colorPalette="cool"
                depth={1}
                label={`Upgrade to the ${PRO_LABEL} Plan`}
                onClick={handleUpgrade}
                size="large"
              /> :
              <div>
                Tell your billing leader
              </div>
            }
          </div>
        </div>
      </Panel>
    </div>
  );
};

TeamArchiveSqueeze.propTypes = {
  isBillingLeader: PropTypes.bool,
  orgId: PropTypes.string.isRequired,
  projectsAvailableCount: PropTypes.number,
  styles: PropTypes.object,
  viewer: PropTypes.object.isRequired
};

const styleThunk = () => ({
  archiveSqueezeOuter: {
    margin: '0 auto',
    maxWidth: '56rem',
    minWidth: 0
  },

  archiveSqueezeInner: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: ui.rowGutter
  },

  archiveSqueezeContent: {
    padding: '0 .5rem 1rem'
  },

  archiveSqueezeHeading: {
    color: ui.palette.mid,
    fontSize: appTheme.typography.s6,
    lineHeight: 1.5,
    margin: '.5rem 0'
  },

  archiveSqueezeCopy: {
    color: ui.palette.dark,
    lineHeight: 1.75,
    fontSize: appTheme.typography.sBase
  },

  archiveSqueezeButtonBlock: {
    padding: '0 1rem'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(TeamArchiveSqueeze),
  graphql`
    fragment TeamArchiveSqueeze_viewer on User {
      archivedProjectsCount(teamId: $teamId)
    }
  `
);
