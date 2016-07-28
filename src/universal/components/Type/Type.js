import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import * as t from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const {cool, warm, dark, mid, light} = t.palette;
const white = '#fff';

let s = {};

const Type = (props) => {
  const {
    align,
    bold,
    children,
    display,
    family,
    italic,
    marginBottom,
    marginTop,
    scale,
    theme,
    width
  } = props;

  const typeStyles = combineStyles(
    s.root,
    s[align],
    s[bold],
    s[display],
    s[family],
    s[scale],
    s[theme],
    s[italic],
    s[width]
  );

  const marginStyle = {
    marginBottom,
    marginTop
  };

  const boldStyles = bold ? s.bold : null;
  const italicStyles = italic ? s.italic : null;

  return (
    <div className={combineStyles(typeStyles, boldStyles, italicStyles)} style={marginStyle}>
      {children}
    </div>
  );
};

Type.propTypes = {
  align: PropTypes.oneOf([
    'left',
    'center',
    'right'
  ]),
  bold: PropTypes.bool,
  children: PropTypes.any,
  display: PropTypes.oneOf([
    'block',
    'inline',
    'inlineBlock'
  ]),
  family: PropTypes.oneOf([
    'sansSerif',
    'serif'
  ]),
  italic: PropTypes.bool,
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
  scale: PropTypes.oneOf([
    'sBase', // 16px
    's1',    // 12px
    's2',    // 13px
    's3',    // 14px
    's4',    // 18px
    's5',    // 20px
    's6',    // 24px
    's7',    // 36px
    's8',    // 48px
  ]),
  theme: PropTypes.oneOf([
    'cool',
    'warm',
    'dark',
    'mid',
    'light',
    'white'
  ]),
  width: PropTypes.oneOf([
    'auto',
    'full'
  ])
};

Type.defaultProps = {
  align: 'left',
  display: 'block',
  family: 'sansSerif',
  marginBottom: '0px',
  marginTop: '0px',
  scale: 'sBase',
  style: 'normal',
  theme: 'dark',
  width: 'full'
};

s = StyleSheet.create({
  root: {
    lineHeight: '1.5'
  },

  // align
  left: {
    textAlign: 'left'
  },

  center: {
    textAlign: 'center'
  },

  right: {
    textAlign: 'right'
  },

  // display
  block: {
    display: 'block'
  },

  inline: {
    display: 'inline'
  },

  inlineBlock: {
    display: 'inline-block'
  },

  // family
  sansSerif: {
    fontFamily: t.typography.sansSerif
  },

  serif: {
    fontFamily: t.typography.serif
  },

  // scale
  sBase: {
    fontSize: t.typography.sBase
  },

  s1: {
    fontSize: t.typography.s1
  },

  s2: {
    fontSize: t.typography.s2
  },

  s3: {
    fontSize: t.typography.s3
  },

  s4: {
    fontSize: t.typography.s4
  },

  s5: {
    fontSize: t.typography.s5
  },

  s6: {
    fontSize: t.typography.s6
  },

  s7: {
    fontSize: t.typography.s7
  },

  s8: {
    fontSize: t.typography.s8
  },

  // style
  italic: {
    fontStyle: 'italic'
  },

  // theme
  cool: {
    color: cool
  },

  warm: {
    color: warm
  },

  dark: {
    color: dark
  },

  mid: {
    color: mid
  },

  light: {
    color: light
  },

  white: {
    color: white
  },

  // weight
  bold: {
    fontWeight: 700
  },

  // width
  auto: {
    width: 'auto'
  },

  full: {
    width: '100%'
  }
});

export default look(Type);
