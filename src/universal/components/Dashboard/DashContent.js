import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';

const backgroundColor = tinycolor.mix(theme.palette.mid10l, '#fff', 50).toHexString();
let styles = {};

const DashContent = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

DashContent.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    backgroundColor,
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(DashContent);
