import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {ib, overflowTouch} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import TeamArchiveHeader from 'universal/modules/teamDashboard/components/TeamArchiveHeader/TeamArchiveHeader';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';

import FontAwesome from 'react-fontawesome';
import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink';

const iconStyle = {
  ...ib,
  fontSize: ui.iconSize,
  marginRight: '.25rem'
};

const TeamArchive = (props) => {
  const {archivedProjects, styles, teamId} = props;
  return (
    <div className={css(styles.root)}>
      <TeamArchiveHeader teamId={teamId} />
      <div className={css(styles.body)}>
        <div className={css(styles.scrollable)}>
          {archivedProjects.length ?
            <div className={css(styles.cardGrid)}>
              {archivedProjects.map((project) =>
                <div className={css(styles.cardBlock)} key={`cardBlockFor${project.id}`}>
                  <OutcomeCardContainer
                    key={project.id}
                    form={`archived::${project.id}`}
                    outcome={project}
                  />
                </div>
              )}
            </div> :
            <div className={css(styles.emptyMsg)}>
              <FontAwesome name="smile-o" style={iconStyle} />
              <span style={ib}>
                Hi there! There are zero archived projects.
                Nothing to see here. How about a fun rally video?
                {' '}<span className={css(styles.link)}>{getRallyLink()}!</span>
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

TeamArchive.propTypes = {
  archivedProjects: PropTypes.array,
  styles: PropTypes.object,
  teamId: PropTypes.string,
  teamMembers: PropTypes.array
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: '0 0 0 1rem',
    width: '100%'
  },

  body: {
    borderTop: `1px solid ${ui.dashBorderColor}`,
    flex: 1,
    position: 'relative'
  },

  scrollable: {
    ...overflowTouch,
    bottom: 0,
    left: 0,
    padding: '1rem 0 0',
    position: 'absolute',
    right: 0,
    top: 0,
  },

  cardGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: ui.projectColumnsMaxWidth,
    width: '100%'
  },

  cardBlock: {
    flex: '0 0 100%',
    padding: '0 1rem .5rem 0',

    '@media (min-width: 40rem)': {
      flex: '0 0 50%'
    },

    '@media (min-width: 60rem)': {
      flex: '0 0 33.3333%'
    },

    '@media (min-width: 80rem)': {
      flex: '0 0 25%'
    },

    '@media (min-width: 100rem)': {
      flex: '0 0 20%'
    }
  },

  emptyMsg: {
    backgroundColor: '#fff',
    border: `1px solid ${appTheme.palette.mid30l}`,
    borderRadius: '.25rem',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s2,
    fontStyle: 'italic',
    display: 'inline-block',
    padding: '1rem'
  },

  link: {
    color: appTheme.palette.cool
  }
});

export default withStyles(styleThunk)(TeamArchive);
