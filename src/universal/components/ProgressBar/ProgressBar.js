import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import t from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';

let s = {};

const ProgressBar = (props) => {
  const {
    completed,
    scale,
    theme
  } = props;

  const height = scale === 'large' ? '.5rem' : '.25rem';
  const backgroundColor = theme === 'cool' ? t.palette.cool50l : t.palette.warm50l;

  s = StyleSheet.create({
    root: {
      display: 'block',
      backgroundColor: t.palette.dark10l,
      borderRadius: height,
      height,
      overflow: 'hidden',
      width: '100%'
    },

    bar: {
      backgroundColor,
      height,
      transition: 'width .2s ease-in',
      width: `${completed}%`
    },

    srOnly
  });

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <div className={s.srOnly}>{completed}%</div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  completed: PropTypes.number,
  scale: PropTypes.oneOf([
    'small',
    'large'
  ]),
  theme: PropTypes.oneOf([
    'cool',
    'warm'
  ])
};

ProgressBar.defaultProps = {
  completed: 64,
  scale: 'small',
  theme: 'cool'
};

export default look(ProgressBar);
