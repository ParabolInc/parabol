import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const EditorLink = (props) => {
  //const {url} = props.contentState.getEntity(props.entityKey).getData();
  const {styles, offsetkey, children} = props;
  console.log('LINK', props)
  return (
    <span data-offset-key={offsetkey} className={css(styles.link)}>
      {children}
    </span>
  );
};

const styleThunk = () => ({
  link: {
    color: 'blue'
  }
});

export default withStyles(styleThunk)(EditorLink);
