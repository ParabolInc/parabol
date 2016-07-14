import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import Pato from 'universal/styles/theme/images/graphics/pato.svg';

let styles = {};

const patoHop = StyleSheet.keyframes({
  '0%': {
    transform: 'translate(0, 0)'
  },
  '10%': {
    transform: 'translate(0, .125rem)'
  },
  '20%': {
    transform: 'translate(0, -.5rem)'
  },
  '30%': {
    transform: 'translate(0, .25rem)'
  },
  '40%': {
    transform: 'translate(0, -.125rem)'
  },
  '45%': {
    transform: 'translate(0, 0)'
  },
  '100%': {
    transform: 'translate(0, 0)'
  }
});

const cbTiming = 'cubic-bezier(.37, 1.13, .58, 1.13)';

const patoStyles = {
  animationDuration: '1.5s',
  animationIterationCount: 'infinite',
  animationName: patoHop,
  animationTimingFunction: cbTiming,
  display: 'inline-block',
  height: 'auto',
  margin: '0 .5rem',
  width: '2rem'
};

const LoadingDuck = (props) => <img alt={'Duck by Sergey Demushkin'} className={props.className} src={Pato}/>;
const LoadingView = () => {
  const {pato1, pato2, pato3} = styles;
  const duckStyles = [pato1, pato2, pato3];
  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Welcome to Action!</h1>
      {duckStyles.map(className => <LoadingDuck className={className}/>)}
      <h2 className={styles.message}>Just putting our ducks in a row…</h2>
    </div>
  );
};

styles = StyleSheet.create({
  root: {
    minHeight: '100vh',
    padding: '3rem 0',
    textAlign: 'center',
    width: '100%'
  },

  heading: {
    color: theme.palette.warm,
    fontSize: theme.typography.s7,
    fontWeight: 700,
    margin: '0 0 2rem'
  },

  pato1: {
    ...patoStyles,
    animationDelay: '200ms'
  },

  pato2: {
    ...patoStyles,
    animationDelay: '500ms'
  },

  pato3: {
    ...patoStyles,
    animationDelay: '800ms'
  },

  message: {
    color: theme.palette.cool,
    fontSize: theme.typography.s5,
    fontWeight: 700,
    margin: '.5rem 0 0'
  }
});

export default look(LoadingView);
