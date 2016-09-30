import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {Type} from 'universal/components';

const SummaryFirstTime = () => {
  const {styles} = SummaryFirstTime;
  return (
    <div className={styles.root}>
      <Type align="center" bold family="serif" marginBottom="2rem" marginTop="2rem" scale="s6" theme="cool">
        Congratulations!
      </Type>
      <Type align="center" marginBottom="2rem" marginTop="2rem" scale="s4">
        You totally rocked your first meeting!<br />
        Now let’s make it a habit. If you haven’t already,<br />
        schedule a 30 minute meeting, preferably<br />
        recurring on Mondays or Tuesdays.
      </Type>
      <Type align="center" marginBottom="2rem" marginTop="2rem" theme="warm">
        TODO: add copy shortlink
      </Type>
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
    width: '100%'
  }
});

export default look(SummaryFirstTime);
