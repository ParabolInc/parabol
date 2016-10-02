import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import Ellipsis from '../Ellipsis/Ellipsis';
import Type from '../Type/Type';
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles';

const NullCard = (props) => {
  const {styles, username} = props;
  return (
    <div className={css(styles.root)}>
      <Type align="center" bold scale="s3" colorPalette="mid">
        @{username}<br />is adding a project<Ellipsis />
      </Type>
    </div>
  );
};

NullCard.propTypes = {
  username: PropTypes.string,
};

const styleThunk = () => ({
  root: {
    ...CreateCardRootStyles
  }
});

export default withStyles(styleThunk)(NullCard);
