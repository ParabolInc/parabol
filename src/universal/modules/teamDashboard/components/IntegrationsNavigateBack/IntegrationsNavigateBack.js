import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router-dom';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import goBackLabel from 'universal/styles/helpers/goBackLabel';
import PropTypes from 'prop-types';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const IntegrationsNavigateBack = ({styles, teamId}) => {
  return (
    <Link className={css(styles.link)} to={`/team/${teamId}/settings/integrations`} title="Back to Integrations">
      <FontAwesome name="arrow-circle-left" style={inlineBlockStyle} />
      <div style={inlineBlockStyle}>Back to <b>Integrations</b></div>
    </Link>
  );
};

IntegrationsNavigateBack.propTypes = {
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired
};

const styleThunk = () => ({
  link: {
    ...goBackLabel,
    display: 'block',
    margin: '1rem 0'
  }
});

export default withStyles(styleThunk)(IntegrationsNavigateBack);
