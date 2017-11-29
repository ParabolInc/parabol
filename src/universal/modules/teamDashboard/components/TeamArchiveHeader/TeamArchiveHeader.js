import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router-dom';
import {DashSectionHeading} from 'universal/components/Dashboard';
import goBackLabel from 'universal/styles/helpers/goBackLabel';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const TeamArchiveHeader = (props) => {
  const {styles, teamId} = props;
  return (
    <div className={css(styles.root)}>
      <DashSectionHeading icon="archive" label="Archived Tasks" margin="0 2rem 0 0" />
      <Link className={css(styles.link)} to={`/team/${teamId}`} title="Back to Team Tasks">
        <FontAwesome name="arrow-circle-left" style={inlineBlockStyle} />
        <div style={inlineBlockStyle}>Back to Team Tasks</div>
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

  link: {...goBackLabel}
});

export default withStyles(styleThunk)(TeamArchiveHeader);
