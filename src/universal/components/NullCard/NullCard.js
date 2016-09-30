import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {Ellipsis, Type} from 'universal/components';
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles';
import {cardBorderTop} from 'universal/styles/helpers';

const NullCard = (props) => {
  const {styles} = NullCard;
  const {username} = props;
  return (
    <div className={styles.root}>
      <Type align="center" bold scale="s3" theme="mid">
        @{username}<br />is adding a project<Ellipsis />
      </Type>
    </div>
  );
};

NullCard.propTypes = {
  username: PropTypes.string,
};

NullCard.defaultProps = {
  username: 'TayaMueller',
};

NullCard.styles = StyleSheet.create({
  root: {
    ...CreateCardRootStyles,
    '::after': {
      ...cardBorderTop,
      color: theme.palette.mid40l
    }
  }
});

export default look(NullCard);
