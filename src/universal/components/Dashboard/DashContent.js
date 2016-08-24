import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';

const backgroundColor = tinycolor.mix(theme.palette.mid10l, '#fff', 50).toHexString();
let styles = {};

const DashContent = (props) => {
  const {children, padding} = props;
  const style = {padding};
  return (
    <div className={styles.root} style={style}>
      {children}
    </div>
  );
};

DashContent.propTypes = {
  children: PropTypes.any,
  padding: PropTypes.string
};

DashContent.defaultProps = {
  padding: '1rem'
};

styles = StyleSheet.create({
  root: {
    backgroundColor,
    flex: 1,
    width: '100%'
  }
});

export default look(DashContent);
