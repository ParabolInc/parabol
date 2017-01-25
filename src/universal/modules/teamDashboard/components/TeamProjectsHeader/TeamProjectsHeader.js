import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ib from 'universal/styles/helpers/ib';
import {
  DashSectionControl,
  DashSectionControls,
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck';
import {Menu, MenuItem} from 'universal/modules/menu';

const iconStyle = {
  ...ib,
  margin: '0 .5rem 0 0'
};

const inlineBlock = {
  display: 'inline-block',
  height: ui.dashSectionHeaderLineHeight,
  lineHeight: ui.dashSectionHeaderLineHeight,
  verticalAlign: 'middle'
};

const TeamProjectsHeader = (props) => {
  const {dispatch, styles, teamId, teamMemberFilterId, teamMemberFilterName, teamMembers} = props;
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="Team Projects" />
      <DashSectionControls>
        {/* TODO: needs link to archive */}
        <DashSectionControl>
          <FontAwesome name="archive" style={iconStyle} />
          <Link className={css(styles.link)} to={`/team/${teamId}/archive`}>
            See Archived Projects
          </Link>
        </DashSectionControl>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <b style={inlineBlock}>Show Actions & Projects for</b><span style={inlineBlock}>:</span>
          {' '}
          {/*<Menu*/}
            {/*label="Filter by:"*/}
            {/*menuKey="TeamDashFilterUser"*/}
            {/*menuOrientation="right"*/}
            {/*toggle={DashFilterToggle}*/}
            {/*toggleLabel={teamMemberFilterName}*/}
            {/*toggleHeight={ui.dashSectionHeaderLineHeight}*/}
            {/*verticalAlign="top"*/}
            {/*zIndex="500"*/}
          {/*>*/}
            {/*<MenuItem*/}
              {/*isActive={teamMemberFilterId === null}*/}
              {/*key={'teamMemberFilterNULL'}*/}
              {/*label={'All members'}*/}
              {/*onClick={() => dispatch(filterTeamMember(null))}*/}
            {/*/>*/}
            {/*{teamMembers.map((teamMember) =>*/}
              {/*<MenuItem*/}
                {/*isActive={teamMember.id === teamMemberFilterId}*/}
                {/*key={`teamMemberFilter${teamMember.id}`}*/}
                {/*label={teamMember.preferredName}*/}
                {/*onClick={() => dispatch(filterTeamMember(teamMember.id, teamMember.preferredName))}*/}
              {/*/>*/}
            {/*)}*/}
          {/*</Menu>*/}
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

TeamProjectsHeader.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string,
  teamMemberFilterId: PropTypes.string,
  teamMemberFilterName: PropTypes.string,
  teamMembers: PropTypes.array.isRequired
};

const styleThunk = () => ({
  button: {
    ...inlineBlock,
    color: appTheme.palette.mid,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  link: {
    ...ib,
    color: appTheme.palette.mid,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  }
});

export default withStyles(styleThunk)(TeamProjectsHeader);
