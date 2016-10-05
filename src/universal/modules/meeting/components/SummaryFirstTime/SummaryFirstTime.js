import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {Type} from 'universal/components';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import FontAwesome from 'react-fontawesome';
import emoji100 from 'universal/styles/theme/images/emoji/apple-emoji-100@3x.png';

const SummaryFirstTime = (props) => {
  const {styles} = props;
  const iconStyle = {
    color: appTheme.palette.dark,
    float: 'left',
    fontSize: ui.iconSize,
    lineHeight: '1.3125rem',
    marginRight: '.375rem'
  };
  const starIconStyle = {
    display: 'inline-block',
    fontSize: ui.iconSize,
    margin: '0 .25rem',
    verticalAlign: 'middle'
  };
  const makeStar = () =>
    <FontAwesome name="star-o" style={starIconStyle} />;
  const makeStarGroup = () =>
    <div className={css(styles.starGroup)}>
      {makeStar()}
      {makeStar()}
      {makeStar()}
    </div>;
  return (
    <div className={css(styles.root)}>
      <img alt="Yaaasss! First meeting, what?" className={css(styles.emoji)} src={emoji100} />
      <div className={css(styles.heading)}>
        {makeStarGroup()}
        <div className={css(styles.headingLabel)}>Congratulations!</div>
        {makeStarGroup()}
      </div>
      <Type align="center" marginBottom="1.25rem" marginTop="1.25rem" scale="s4">

        You totally rocked your first meeting!<br />
        Now let’s make it a habit: schedule a<br />
        recurring 30 minute meeting starting next<br />
        week, preferably on Mondays or Tuesdays.

      </Type>
      <Type display="inlineBlock" marginBottom="1rem" marginTop="0px" scale="s3" colorPalette="dark" width="auto">
        <FontAwesome name="lightbulb-o" style={iconStyle} />
        <div style={{overflow: 'hidden'}}>
          <b>Pro tip</b>:<br />
          Include the following link to the meeting lobby<br />
          in your recurring calendar event.
        </div>
      </Type>
      <CopyShortLink url="https://prbl.io/a/b7s8x9" />
    </div>
  );
};

SummaryFirstTime.propTypes = {
  styles: PropTypes.object
};

const borderColor = appTheme.palette.cool50l;

const styleThunk = () => ({
  root: {
    border: `2px solid ${borderColor}`,
    maxWidth: '37.5rem',
    padding: '1rem 0 2rem',
    position: 'relative',
    textAlign: 'center',
    width: '100%'
  },

  heading: {
    color: appTheme.palette.cool,
    fontSize: 0,
    margin: '1rem 0',
    position: 'relative',
    textAlign: 'center',

    '::after': {
      backgroundColor: borderColor,
      content: '""',
      display: 'block',
      height: '2px',
      left: 0,
      marginTop: '-1px',
      position: 'absolute',
      top: '50%',
      width: '100%'
    }
  },

  headingLabel: {
    backgroundColor: '#fff',
    display: 'inline-block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    margin: '0 2rem',
    padding: '0 1rem',
    position: 'relative',
    verticalAlign: 'middle',
    zIndex: 200
  },

  emoji: {
    height: '51px',
    position: 'absolute',
    right: '2rem',
    top: '5rem',
    width: '48px'
  },

  starGroup: {
    backgroundColor: '#fff',
    display: 'inline-block',
    padding: '0 .5rem',
    position: 'relative',
    verticalAlign: 'middle',
    zIndex: 200
  }
});

export default withStyles(styleThunk)(SummaryFirstTime);
