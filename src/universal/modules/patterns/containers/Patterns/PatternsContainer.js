import React from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';
import {Menu, MenuToggle, Type} from 'universal/components';
import FontAwesome from 'react-fontawesome';
import exampleMenu from 'universal/modules/patterns/helpers/exampleMenu';

const makeLabel = (string) =>
  <Type bold family="monospace" marginBottom="1rem" scale="s2">{'<'}{string}{' />'}</Type>;

const style = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const demoIconSize = '28px';

const demoToggleStyle = {
  display: 'block',
  fontSize: demoIconSize,
  height: demoIconSize,
  lineHeight: demoIconSize
};

const demoToggle = (<FontAwesome name="plus-square-o" style={demoToggleStyle} />);

const PatternsContainer = () =>
  <div style={style}>
    <Helmet title="Welcome to the Action Pattern Library" {...head} />

    <h1>Pattern Library</h1>

    {makeLabel('MenuToggle')}
    {makeLabel('Menu')}
    <MenuToggle menuOrientation="left" toggle={demoToggle}>
      <Menu items={exampleMenu} label="Select Team:" />
    </MenuToggle>

  </div>;

export default PatternsContainer;
