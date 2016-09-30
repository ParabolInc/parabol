import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {Type} from 'universal/components';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import FontAwesome from 'react-fontawesome';

const SummaryFirstTime = () => {
  const {styles} = SummaryFirstTime;
  const iconStyle = {
    color: theme.palette.dark,
    float: 'left',
    fontSize: ui.iconSize,
    lineHeight: '1.3125rem',
    marginRight: '.375rem'
  };
  return (
    <div className={styles.root}>
      <Type align="center" bold family="serif" marginBottom="1rem" marginTop="1rem" scale="s6" theme="cool">
        Congratulations!
      </Type>
      <Type align="center" marginBottom="1rem" marginTop="1rem" scale="s4">
        You totally rocked your first meeting!<br />
        Now let’s make it a habit. If you haven’t already,<br />
        schedule a 30 minute meeting, preferably<br />
        recurring on Mondays or Tuesdays.
      </Type>
      <Type display="inlineBlock" marginBottom="1rem" marginTop="0px" scale="s3" theme="dark" width="auto">
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
  // Define
};

SummaryFirstTime.defaultProps = {
  // Define
};

SummaryFirstTime.styles = StyleSheet.create({
  root: {
    border: `2px solid ${theme.palette.cool50l}`,
    maxWidth: '37.5rem',
    padding: '1rem 0 2rem',
    textAlign: 'center',
    width: '100%'
  }
});

export default look(SummaryFirstTime);
