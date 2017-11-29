import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import PropTypes from 'prop-types';

const TaskIntegrationLink = (props) => {
  const {styles, integration} = props;
  const {nameWithOwner, issueNumber} = integration || {};
  if (!issueNumber) return null;
  // TODO make this async and point to subcomponents when we have more than github
  return (
    <a
      className={css(styles.demoLink)}
      href={`https://www.github.com/${nameWithOwner}/issues/${issueNumber}`}
      rel="noopener noreferrer"
      target="_blank"
      title={`GitHub Issue #${issueNumber} on ${nameWithOwner}`}
    >
      {`Issue #${issueNumber}`}
    </a>
  );
};

TaskIntegrationLink.propTypes = {
  integration: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  demoLink: {
    color: ui.palette.cool,
    display: 'block',
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: '1.25rem',
    padding: '0 .5rem'
  }
});

export default withStyles(styleThunk)(TaskIntegrationLink);
