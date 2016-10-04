import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
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
  const {styles, teamId} = props;
  return (
    <div className={css(styles.root)}>
      <DashSectionHeading icon="archive" label="Archived Projects" margin="0 2rem 0 0" />
      <Link className={css(styles.link)} to={`/team/${teamId}`} title="Back to Team Projects">
        <FontAwesome name="arrow-circle-left" style={iconStyle} />
        <div style={inlineBlockStyle}>Back to Team Projects</div>
      </Link>
    </div>
  );
};

TeamArchiveHeader.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object,
  teamId: PropTypes.string
};

const styleThunk = () => ({
  root: {
    padding: '1rem 1rem 1rem 0',
    width: '100%'
  },

  link: {
    ...inlineBlockStyle,
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s3,
    height: ui.dashSectionHeaderLineHeight,
    paddingTop: '1px',

    ':hover': {
      color: appTheme.palette.dark,
    },
    ':focus': {
      color: appTheme.palette.dark,
    },
    ':hover > div': {
      textDecoration: 'underline'
    },
    ':focus > div': {
      textDecoration: 'underline'
    },
  }
});

export default withStyles(styleThunk)(TeamArchiveHeader);
