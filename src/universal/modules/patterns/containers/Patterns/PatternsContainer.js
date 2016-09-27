import React from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';
import Type from 'universal/components/Type/Type';

const makeLabel = (string) =>
  <Type bold family="monospace" marginBottom="1rem" scale="s2">{'<'}{string}{' />'}</Type>;

const style = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const PatternsContainer = () =>
  <div style={style}>
    <Helmet title="Welcome to the Action Pattern Library" {...head} />

    <h1>Pattern Library</h1>

    {makeLabel('Component Label')}

  </div>;

export default PatternsContainer;
