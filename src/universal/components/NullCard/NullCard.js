import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import {Ellipsis, Type} from 'universal/components';
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles';
import {cardBorderTop} from 'universal/styles/helpers';

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
  styles: PropTypes.object,
  username: PropTypes.string,
};

const styleThunk = () => ({
  root: {
    ...CreateCardRootStyles,

    '::after': {
      ...cardBorderTop,
      color: appTheme.palette.mid40l
    }
  }
});

export default withStyles(styleThunk)(NullCard);
