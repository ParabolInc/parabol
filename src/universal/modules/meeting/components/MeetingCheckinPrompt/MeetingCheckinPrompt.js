import React from 'react';
import PropTypes from 'prop-types';
import {css} from 'aphrodite-local-styles/no-important';

import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';

import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';


const greetingPropType = PropTypes.shape({
  content: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired
});

const greetingStyleThunk = () => ({
  greeting: {
    borderBottom: '1px dashed currentColor',
    color: 'inherit',
    cursor: 'help'
  }
});

let Greeting = ({currentName, greeting, styles}) => (
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

Greeting.propTypes = {
  currentName: PropTypes.string.isRequired,
  greeting: greetingPropType,
  styles: PropTypes.object.isRequired
};

Greeting = withStyles(greetingStyleThunk)(Greeting);


const MeetingCheckinPrompt = ({avatar, canEdit, currentName, checkInQuestion, greeting}) => {
  const heading = (
    <div>
      <Greeting currentName={currentName} greeting={greeting} />
      {checkInQuestion}?
    </div>
  );
  return (
    <MeetingPrompt
      avatar={avatar}
      avatarLarge
      heading={heading}
    />
  );
};

MeetingCheckinPrompt.propTypes = {
  avatar: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  currentName: PropTypes.string.isRequired,
  checkInQuestion: PropTypes.string.isRequired,
  greeting: greetingPropType,
  handleSubmit: PropTypes.func
};

export default MeetingCheckinPrompt;
