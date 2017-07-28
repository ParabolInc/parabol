import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const ProjectIntegrationLink = (props) => {
  const {styles, integration} = props;
  const {nameWithOwner, issueNumber} = integration || {};
  if (!issueNumber) return null;
  return (
    <a
      className={css(styles.demoLink)}
      href={`https://www.github.com/${nameWithOwner}/issues/${issueNumber}`}
      rel="noopener noreferrer"
      target="_blank"
      title={`Issue #${issueNumber} on GitHub`}
    >
      {`Issue #${issueNumber}`}
    </a>
  );
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

export default withStyles(styleThunk)(ProjectIntegrationLink);