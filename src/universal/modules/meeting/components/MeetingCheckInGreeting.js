import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';

import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';


const MeetingCheckInGreeting = ({currentName, greeting, styles}) => (
  <div style={{color: appTheme.palette.warm}}>
    <span
      className={css(styles.greeting)}
      title={`${greeting.content} means “hello” in ${greeting.language}`}
    >
      {greeting.content}
    </span>
    {`, ${currentName}`}
  </div>
);

MeetingCheckInGreeting.propTypes = {
  currentName: PropTypes.string.isRequired,
  greeting: PropTypes.shape({
    content: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired
  }),
  styles: PropTypes.object.isRequired
};

const greetingStyleThunk = () => ({
  greeting: {
    borderBottom: '1px dashed currentColor',
    color: 'inherit',
    cursor: 'help'
  }
});

export default withStyles(greetingStyleThunk)(MeetingCheckInGreeting);
