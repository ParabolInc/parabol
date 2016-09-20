import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import Ellipsis from '../Ellipsis/Ellipsis';
import Type from '../Type/Type';
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles';

let s = {};

const NullCard = (props) => {
  const {username} = props;
  return (
    <div className={s.root}>
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

s = StyleSheet.create({
  root: {
    ...CreateCardRootStyles
  }
});

export default look(NullCard);
