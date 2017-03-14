import React from 'react';
import Helmet from 'react-helmet';
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Button from 'universal/components/Button/Button';

const rootStyle = {
  // margin: '0 auto',
  // maxWidth: '80rem',
  // padding: '2rem'
};

const PatternsContainer = () =>
  <div style={rootStyle}>
    <Helmet title="Welcome to the Action Pattern Library" />

    <Spinner fillColor="warm" width={64} />

    <h2>IconAvatar examples</h2>
    <IconAvatar colorPalette="mid" icon="bell" size="small" />
    <IconAvatar colorPalette="cool" icon="user" size="medium" />
    <IconAvatar colorPalette="warm" icon="credit-card" size="large" />

    <h2>Button variants</h2>
    <Button colorPalette="warm" icon="info-circle" label="Button" size="smallest" />{' '}
    <Button colorPalette="warm" label="Button" size="smallest" />{' '}
    <Button colorPalette="warm" label="Button" size="smallest" buttonStyle="flat" />
    <br />
    <br />
    <Button colorPalette="dark" icon="info-circle" label="Button" size="small" />{' '}
    <Button colorPalette="dark" label="Button" size="small" />{' '}
    <Button colorPalette="dark" label="Button" size="small" buttonStyle="flat" />
    <br />
    <br />
    <Button colorPalette="mid" icon="info-circle" label="Button" size="medium" />{' '}
    <Button colorPalette="mid" label="Button" size="medium" />{' '}
    <Button colorPalette="mid" label="Button" size="medium" buttonStyle="flat" />
    <br />
    <br />
    <Button colorPalette="cool" icon="info-circle" label="Button" size="large" />{' '}
    <Button colorPalette="cool" label="Button" size="large" />{' '}
    <Button colorPalette="cool" label="Button" size="large" buttonStyle="flat" />
    <br />
    <br />
    <Button colorPalette="gray" icon="info-circle" label="Button" size="largest" />{' '}
    <Button colorPalette="gray" label="Button" size="largest" />{' '}
    <Button colorPalette="gray" label="Button" size="largest" buttonStyle="flat" />

    <h2>Invoice presentation</h2>
  </div>;

export default PatternsContainer;
