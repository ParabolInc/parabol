import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createRefetchContainer} from 'react-relay';
import withRouter from 'react-router-dom/es/withRouter';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {PERSONAL_LABEL, PRO_LABEL} from 'universal/utils/constants';
import {PRICING_LINK} from 'universal/utils/externalLinks';

const linkLabel = 'Compare Plans';
const iconStyles = {
  fontSize: ui.iconSize,
  marginLeft: '.25rem',
  verticalAlign: 'middle'
};

class TeamArchiveSqueeze extends Component {
  componentWillReceiveProps(nextProps) {
    const {projectsAvailableCount: oldCount, relay: {refetch}} = this.props;
    const {projectsAvailableCount: newCount} = nextProps;
    if (newCount !== oldCount) {
      refetch();
    }
  }
  render() {
    const {history, orgId, projectsAvailableCount, styles, viewer} = this.props;
    const {archivedProjectsCount, team: {organization: {isBillingLeader, mainBillingLeader}}} = viewer;
    const unavailableProjects = archivedProjectsCount - projectsAvailableCount;
    if (unavailableProjects < 1) {
      // https://github.com/reactjs/react-transition-group/issues/208
      return <br />;
    }
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
                {'With the '}<b>{`${PERSONAL_LABEL} Plan`}</b>{' you can see cards archived up to '}<b>{'14 days ago'}</b>{'.'}<br />
                {'For full access to your team’s archive, upgrade to the '}<b>{`${PRO_LABEL} Plan`}</b>{'.'}<br />
                <a href={PRICING_LINK} target="_blank" title={linkLabel}>
                  <b>{linkLabel}</b> <FontAwesome name="external-link-square" style={iconStyles} />
                </a>
              </p>
            </div>
            <div className={css(styles.archiveSqueezeButtonBlock)}>
              {isBillingLeader ?
                <Button
                  buttonSize="medium"
                  colorPalette="cool"
                  depth={1}
                  label={`Upgrade to the ${PRO_LABEL} Plan`}
                  onClick={handleUpgrade}
                /> :
                <div className={css(styles.contactCopy)}>
                  {'Talk with your '}<b>{'Billing Leader'}</b>{':'}
                  <a
                    className={css(styles.contactLink)}
                    href={`mailto:${mainBillingLeader.email}`}
                    title={`Email: ${mainBillingLeader.email}`}
                  >
                    <div className={css(styles.contactLinkLabel)}>
                      {mainBillingLeader.preferredName}
                    </div>
                    <FontAwesome name="envelope" style={iconStyles} />
                  </a>
                </div>
              }
            </div>
          </div>
        </Panel>
      </div>
    );
  }
}

TeamArchiveSqueeze.propTypes = {
  history: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
  projectsAvailableCount: PropTypes.number,
  relay: PropTypes.object.isRequired,
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
  },

  contactCopy: {
    color: ui.palette.dark,
    fontSize: appTheme.typography.sBase,
    lineHeight: 1.5,
    textAlign: 'center'
  },

  contactLink: {
    display: 'block',
    fontSize: 0,
    fontWeight: 700
  },

  contactLinkLabel: {
    display: 'inline-block',
    fontSize: appTheme.typography.s6,
    paddingRight: '.25rem',
    verticalAlign: 'middle'
  }
});

export default createRefetchContainer(
  withRouter(withStyles(styleThunk)(TeamArchiveSqueeze)),
  graphql`
    fragment TeamArchiveSqueeze_viewer on User {
      archivedProjectsCount(teamId: $teamId)
      team(teamId: $teamId) {
        organization {
          isBillingLeader
          mainBillingLeader {
            preferredName
            email
          }
        }
      }
    }
  `,
  graphql`
    query TeamArchiveSqueezeRefetchQuery($teamId: ID!) {
      viewer {
        archivedProjectsCount(teamId: $teamId)
      }
    }
  `
);
