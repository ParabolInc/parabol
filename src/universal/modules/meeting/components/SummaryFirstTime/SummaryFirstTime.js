import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {Type} from 'universal/components';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import FontAwesome from 'react-fontawesome';

const SummaryFirstTime = (props) => {
  const {styles} = props;
  const iconStyle = {
    color: appTheme.palette.dark,
    float: 'left',
    fontSize: ui.iconSize,
    lineHeight: '1.3125rem',
    marginRight: '.375rem'
  };
  return (
    <div className={css(styles.root)}>
      <Type align="center" bold family="serif" marginBottom="1rem" marginTop="1rem" scale="s6" colorPalette="cool">
        Congratulations!
      </Type>
      <Type align="center" marginBottom="1rem" marginTop="1rem" scale="s4">
        You totally rocked your first meeting!<br />
        Now let’s make it a habit. If you haven’t already,<br />
        schedule a 30 minute meeting, preferably<br />
        recurring on Mondays or Tuesdays.
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

const styleThunk = () => ({
  root: {
    border: `2px solid ${appTheme.palette.cool50l}`,
    maxWidth: '37.5rem',
    padding: '1rem 0 2rem',
    textAlign: 'center',
    width: '100%'
  }
});

export default withStyles(styleThunk)(SummaryFirstTime);
