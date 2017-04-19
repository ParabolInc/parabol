import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const white = '#fff';
const black = appTheme.palette.dark10d;
const palettePlus = {...appTheme.palette, white, black};

const Type = (props) => {
  const {
    align,
    bold,
    children,
    display,
    family,
    italic,
    lineHeight,
    marginBottom,
    marginTop,
    scale,
    colorPalette,
    weight,
    width
  } = props;

  const weights = {
    bold: 700,
    light: 300,
    regular: 400
  };
  const fontWeight = bold ? 700 : weights[weight];

  const styleTag = {
    color: palettePlus[colorPalette],
    display: display === 'inlineBlock' ? 'inline-block' : display,
    fontFamily: appTheme.typography[family],
    fontSize: appTheme.typography[scale],
    fontStyle: italic ? 'italic' : null,
    fontWeight,
    lineHeight,
    marginBottom,
    marginTop,
    textAlign: align,
    verticalAlign: display === 'inlineBlock' ? 'middle' : null,
    width: width === 'full' ? '100%' : width
  };

  // mutates the above object, getting rid of nulls. not sure if react does this for us?
  Object.keys(styleTag).forEach((tag) => {
    if (styleTag[tag] === null) {
      delete styleTag[tag];
    }
  });

  return (
    <div style={styleTag}>
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
    'monospace',
    'sansSerif',
    'serif'
  ]),
  italic: PropTypes.bool,
  light: PropTypes.bool,
  lineHeight: PropTypes.string,
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
  colorPalette: PropTypes.oneOf([
    'cool',
    'warm',
    'dark',
    'mid',
    'light',
    'black',
    'white'
  ]),
  weight: PropTypes.oneOf([
    'bold',
    'light',
    'regular'
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
  lineHeight: '1.5',
  marginBottom: '0px',
  marginTop: '0px',
  scale: 'sBase',
  style: 'normal',
  colorPalette: 'dark',
  weight: 'regular',
  width: 'full'
};

export default Type;
