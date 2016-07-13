import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import Pato from 'universal/styles/theme/images/graphics/pato.svg';

let styles = {};

const keyframesUno = StyleSheet.keyframes({
  '0%': {
    transform: 'translate(0, 0)'
  },
  '10%': {
    transform: 'translate(0, -.5rem)'
  },
  '20%': {
    transform: 'translate(0, .25rem)'
  },
  '30%': {
    transform: 'translate(0, -.125rem)'
  },
  '35%': {
    transform: 'translate(0, 0)'
  },
  '100%': {
    transform: 'translate(0)'
  }
});

const keyframesDos = StyleSheet.keyframes({
  '0%': {
    transform: 'translate(0, 0)'
  },
  '10%': {
    transform: 'translate(0, 0)'
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
    transform: 'translate(0)'
  }
});

const keyframesTres = StyleSheet.keyframes({
  '0%': {
    transform: 'translate(0, 0)'
  },
  '20%': {
    transform: 'translate(0, 0)'
  },
  '30%': {
    transform: 'translate(0, -.5rem)'
  },
  '40%': {
    transform: 'translate(0, .25rem)'
  },
  '50%': {
    transform: 'translate(0, -.125rem)'
  },
  '55%': {
    transform: 'translate(0, 0)'
  },
  '100%': {
    transform: 'translate(0)'
  }
});

const cbTiming = 'cubic-bezier(.37, 1.13, .58, 1.13)';

const patoStyles = {
  animationDuration: '1.5s',
  animationIterationCount: 'infinite',
  animationTimingFunction: cbTiming,
  display: 'inline-block',
  height: 'auto',
  margin: '0 .5rem',
  width: '2rem'
};

const LoadingView = () => {
  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Welcome to Action!</h1>
      <img alt="Duck by Sergey Demushkin" className={styles.patoUno} src={Pato} />
      <img alt="Duck by Sergey Demushkin" className={styles.patoDos} src={Pato} />
      <img alt="Duck by Sergey Demushkin" className={styles.patoTres} src={Pato} />
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

  patoUno: {
    ...patoStyles,
    animationName: keyframesUno
  },

  patoDos: {
    ...patoStyles,
    animationName: keyframesDos
  },

  patoTres: {
    ...patoStyles,
    animationName: keyframesTres
  },

  message: {
    color: theme.palette.cool,
    fontSize: theme.typography.s5,
    fontWeight: 700,
    margin: '.5rem 0 0'
  }
});

export default look(LoadingView);
