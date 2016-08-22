import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import Ellipsis from '../Ellipsis/Ellipsis';
import Type from '../Type/Type';
import theme from 'universal/styles/theme';

let s = {};

const CreateCard = props => {
  const {username} = props;
  return (
    <div className={s.root}>
      <Type align="center" bold scale="s3" theme="mid">
        @{username}<br />is adding a project<Ellipsis />
      </Type>
    </div>
  );
};

CreateCard.propTypes = {
  username: PropTypes.string,
};

CreateCard.defaultProps = {
  username: 'TayaMueller',
};

s = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
    border: `1px solid ${theme.palette.mid40l}`,
    borderRadius: '.5rem',
    borderTop: `.25rem solid ${theme.palette.mid40l}`,
    display: 'flex !important',
    justifyContent: 'center',
    maxWidth: '20rem',
    minHeight: '126px',
    padding: '.5rem 1.25rem',
    width: '100%'
  }
});

export default look(CreateCard);
