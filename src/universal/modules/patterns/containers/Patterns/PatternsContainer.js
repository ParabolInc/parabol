import React from 'react';
import Helmet from 'react-helmet';
import Button from 'universal/components/Button/Button';

const rootStyle = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const buttonRow = {
  margin: '2rem 0'
};

const icon = 'ellipsis-v';
const icon2 = 'arrow-circle-right';
const buttonStyle1 = 'solid';
const buttonStyle2 = 'flat';
const buttonBlock = {
  display: 'inline-block',
  marginLeft: '1em',
  verticalAlign: 'middle',
  width: 'auto'
};

const PatternsContainer = () =>
  <div style={rootStyle}>
    <Helmet title="Welcome to the Action Pattern Library" />

    <h1>Pattern Library</h1>

    <div style={buttonRow}>
      <Button colorPalette="dark" icon="cog" label="User Settings" style={buttonStyle1} size="smallest"/>
      <div style={buttonBlock}>
        <Button colorPalette="dark" compact icon={icon} style={buttonStyle2} size="smallest"/>
      </div>
      <div style={buttonBlock}>
        <Button colorPalette="dark" compact label="Next Phase" icon={icon2} iconPlacement="right" style={buttonStyle2} size="smallest"/>
      </div>
    </div>

    <div style={buttonRow}>
      <Button colorPalette="mid" icon="cog" label="User Settings" style={buttonStyle1} size="small"/>
      <div style={buttonBlock}>
        <Button colorPalette="mid" compact icon={icon} style={buttonStyle2} size="small"/>
      </div>
      <div style={buttonBlock}>
        <Button colorPalette="mid" compact label="Next Phase" icon={icon2} iconPlacement="right" style={buttonStyle2} size="small"/>
      </div>
    </div>

    <div style={buttonRow}>
      <Button colorPalette="cool" icon="cog" label="User Settings" style={buttonStyle1} size="medium"/>
      <div style={buttonBlock}>
        <Button colorPalette="cool" compact icon={icon} style={buttonStyle2} size="medium"/>
      </div>
      <div style={buttonBlock}>
        <Button colorPalette="cool" compact label="Next Phase" icon={icon2} iconPlacement="right" style={buttonStyle2} size="medium"/>
      </div>
    </div>

    <div style={buttonRow}>
      <Button colorPalette="cool" icon="cog" label="User Settings" style={buttonStyle1} size="large"/>
      <div style={buttonBlock}>
        <Button colorPalette="cool" compact icon={icon} style={buttonStyle2} size="large"/>
      </div>
      <div style={buttonBlock}>
        <Button colorPalette="cool" compact label="Next Phase" icon={icon2} iconPlacement="right" style={buttonStyle2} size="large"/>
      </div>
    </div>

    <div style={buttonRow}>
      <Button colorPalette="warm" icon="cog" label="User Settings" style={buttonStyle1} size="largest"/>
      <div style={buttonBlock}>
        <Button colorPalette="warm" compact icon={icon} style={buttonStyle2} size="largest"/>
      </div>
      <div style={buttonBlock}>
        <Button colorPalette="warm" compact label="Next Phase" icon={icon2} iconPlacement="right" style={buttonStyle2} size="largest"/>
      </div>
    </div>

  </div>;

export default PatternsContainer;
