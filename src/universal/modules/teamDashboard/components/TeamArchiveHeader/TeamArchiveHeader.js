import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';
import {DashSectionHeading} from 'universal/components/Dashboard';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const iconStyle = {
  ...inlineBlockStyle,
  margin: '0 .5rem 0 0'
};

const TeamArchiveHeader = (props) => {
  const {teamId} = props;
  const {styles} = TeamArchiveHeader;
  return (
    <div className={styles.root}>
      <DashSectionHeading icon="archive" label="Archived Projects" margin="0 2rem 0 0" />
      <Link className={styles.link} to={`/team/${teamId}`} title="Back to Team Projects">
        <FontAwesome name="arrow-circle-left" style={iconStyle} />
        <div style={inlineBlockStyle}>Back to Team Projects</div>
      </Link>
    </div>
  );
};

TeamArchiveHeader.propTypes = {
  children: PropTypes.any,
  teamId: PropTypes.string
};

TeamArchiveHeader.styles = StyleSheet.create({
  root: {
    padding: '1rem 1rem 1rem 0',
    width: '100%'
  },

  link: {
    ...inlineBlockStyle,
    color: theme.palette.mid,
    fontSize: theme.typography.s3,
    height: ui.dashSectionHeaderLineHeight,
    paddingTop: '1px',

    ':hover': {
      color: theme.palette.dark,
    },
    ':focus': {
      color: theme.palette.dark,
    },
    ':hover > div': {
      textDecoration: 'underline'
    },
    ':focus > div': {
      textDecoration: 'underline'
    },
  }
});

export default look(TeamArchiveHeader);
