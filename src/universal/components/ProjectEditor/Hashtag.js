import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const Hashtag = (props) => {
  //const {url} = props.contentState.getEntity(props.entityKey).getData();
  const {styles, offsetkey, children} = props;
  return (
    <span data-offset-key={offsetkey} className={css(styles.hashtag)}>
      {children}
    </span>
  );
};

const styleThunk = () => ({
  hashtag: {
    color: appTheme.palette.cool,
    fontWeight: 800

  }
});

export default withStyles(styleThunk)(Hashtag);