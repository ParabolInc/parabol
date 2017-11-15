import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProjectColumn from 'universal/modules/teamDashboard/components/ProjectColumn/ProjectColumn';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {columnArray, MEETING, meetingColumnArray} from 'universal/utils/constants';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer';

class ProjectColumns extends Component {
  componentWillMount() {
    const {projects} = this.props;
    this.groupProjectsByStatus(projects);
  }

  componentWillReceiveProps(nextProps) {
    const {projects} = nextProps;
    const {projects: oldProjects} = this.props;
    if (projects !== oldProjects) {
      this.groupProjectsByStatus(projects);
    }
  }

  groupProjectsByStatus(projects) {
    const nodes = projects.edges.map(({node}) => node);
    this.setState({
      projects: makeProjectsByStatus(nodes)
    });
  }

  render() {
    // myTeamMemberId is undefined if this is coming from USER_DASH
    // TODO we only need userId, we can compute myTeamMemberId
    const {
      alignColumns,
      area,
      myTeamMemberId,
      styles,
      teams,
      teamMemberFilterId
    } = this.props;

    const {projects} = this.state;
    const rootStyles = css(styles.root, styles[alignColumns]);
    const lanes = area === MEETING ? meetingColumnArray : columnArray;
    return (
      <div className={rootStyles}>
        <div className={css(styles.columns)}>
          {lanes.map((status, idx) =>
            (<ProjectColumn
              key={`projectCol${status}`}
              area={area}
              firstColumn={idx === 0}
              lastColumn={idx === (lanes.length - 1)}
              myTeamMemberId={myTeamMemberId}
              teamMemberFilterId={teamMemberFilterId}
              projects={projects[status]}
              status={status}
              teams={teams}
            />)
          )}
        </div>
      <EditorHelpModalContainer />
    </div>
    );
  }
}

ProjectColumns.propTypes = {
  alignColumns: PropTypes.oneOf([
    'center',
    'left',
    'right'
  ]),
  area: PropTypes.string,
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamMemberFilterId: PropTypes.string,
  teams: PropTypes.array
};

ProjectColumns.defaultProps = {
  alignColumns: 'left'
};

const styleThunk = () => ({
  root: {
    borderTop: `1px solid ${ui.dashBorderColor}`,
    display: 'flex',
    flex: '1',
    width: '100%'
  },

  center: {
    justifyContent: 'center'
  },

  left: {
    justifyContent: 'flex-start'
  },

  right: {
    justifyContent: 'flex-end'
  },

  columns: {
    display: 'flex !important',
    maxWidth: ui.projectColumnsMaxWidth,
    minWidth: ui.projectColumnsMinWidth,
    width: '100%'
  }
});

export default withStyles(styleThunk)(ProjectColumns);
