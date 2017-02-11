// import React, {PropTypes} from 'react';
// import withStyles from 'universal/styles/withStyles';
// import {css} from 'aphrodite-local-styles/no-important';
// import appTheme from 'universal/styles/theme/appTheme';
// import ui from 'universal/styles/ui';
// import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
//
// import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
// import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
// import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
// import FieldShortcutHint from 'universal/components/FieldShortcutHint/FieldShortcutHint';
// import IconButton from 'universal/components/IconButton/IconButton';
//
// const DropdownField = (props) => {
//   const {
//     autoFocus,
//     buttonDisabled,
//     buttonIcon,
//     colorPalette,
//     disabled,
//     hasButton,
//     input,
//     isLarger,
//     isWider,
//     label,
//     meta: {touched, error},
//     onButtonClick,
//     placeholder,
//     readyOnly,
//     shortcutHint,
//     styles
//   } = props;
//
//   const inputStyles = css(
//     // allow hotkeys to be triggered when inside a field input
//     styles.field,
//     colorPalette ? styles[colorPalette] : styles.white,
//     disabled && styles.disabled,
//     isLarger && styles.fieldLarger,
//     readyOnly && styles.readyOnly,
//     isWider && styles.fieldWider
//   );
//
//   const makeLabelNameForInput = () => {
//     return input && input.name || null;
//   };
//   let ref;
//   const submitOnEnter = (e) => {
//     if (e.key === 'Enter') {
//       // let's manually blur here so if a parent calls untouch it occur after the blur (which calls touch by default)
//       ref.blur();
//       input.onBlur();
//       onButtonClick(e);
//     }
//   };
//
//   return (
//     <FieldBlock>
//       {label &&
//         <FieldLabel label={label} htmlFor={makeLabelNameForInput()} />
//       }
//       <div className={css(styles.inputBlock)}>
//         <input
//           {...input}
//           autoFocus={autoFocus}
//           className={`${inputStyles}`}
//           disabled={disabled || readyOnly}
//           placeholder={placeholder}
//           onKeyDown={onButtonClick && submitOnEnter}
//           ref={(c) => { ref = c; }}
//         />
//         {hasButton &&
//           <div className={css(styles.buttonBlock)}>
//             <IconButton
//               disabled={buttonDisabled}
//               iconName={buttonIcon}
//               iconSize="2x"
//               onClick={onButtonClick}
//             />
//           </div>
//         }
//       </div>
//       {touched && error && <FieldHelpText hasErrorText helpText={error} />}
//       {shortcutHint && <FieldShortcutHint disabled={buttonDisabled} hint={shortcutHint} />}
//     </FieldBlock>
//   );
// };
//
// DropdownField.propTypes = {
//   hasErrorText: PropTypes.bool,
//   helpText: PropTypes.any,
//   autoFocus: PropTypes.bool,
//   buttonDisabled: PropTypes.bool,
//   buttonIcon: PropTypes.string,
//   hasButton: PropTypes.bool,
//   disabled: PropTypes.bool,
//   isLarger: PropTypes.bool,
//   readyOnly: PropTypes.bool,
//   label: PropTypes.string,
//   onButtonClick: PropTypes.func,
//   placeholder: PropTypes.string,
//   shortcutHint: PropTypes.string,
//   input: PropTypes.shape({
//     name: PropTypes.string,
//     onBlur: PropTypes.func,
//     onChange: PropTypes.func,
//     onFocus: PropTypes.func,
//     type: PropTypes.string,
//     value: PropTypes.string
//   }),
//   isWider: PropTypes.bool,
//   styles: PropTypes.object,
//   colorPalette: PropTypes.oneOf([
//     'cool',
//     'gray',
//     'warm',
//     'white'
//   ]),
//   meta: PropTypes.object.isRequired
// };
//
// const palettes = {
//   cool: {
//     backgroundColor: appTheme.palette.cool10l,
//     borderColor: appTheme.palette.cool40l,
//     color: appTheme.palette.cool,
//     focusBorderColor: appTheme.palette.cool,
//     placeholder: makePlaceholderStyles(appTheme.palette.cool70l),
//     selection: appTheme.palette.cool20l
//   },
//   gray: {
//     backgroundColor: appTheme.palette.mid10l,
//     borderColor: appTheme.palette.mid40l,
//     color: appTheme.palette.dark,
//     focusBorderColor: appTheme.palette.dark,
//     placeholder: makePlaceholderStyles(appTheme.palette.mid70l),
//     selection: appTheme.palette.mid20l
//   },
//   warm: {
//     backgroundColor: appTheme.palette.warm10l,
//     borderColor: appTheme.palette.warm40l,
//     color: appTheme.palette.warm,
//     focusBorderColor: appTheme.palette.warm,
//     placeholder: makePlaceholderStyles(appTheme.palette.warm70l),
//     selection: appTheme.palette.warm20l
//   },
//   white: {
//     backgroundColor: '#fff',
//     borderColor: appTheme.palette.mid40l,
//     color: appTheme.palette.dark,
//     focusBorderColor: appTheme.palette.dark,
//     placeholder: makePlaceholderStyles(appTheme.palette.mid70l),
//     selection: appTheme.palette.mid20l
//   }
// };
//
// const makeColorPalette = (theme) => {
//   return {
//     backgroundColor: palettes[theme].backgroundColor,
//     borderColor: palettes[theme].borderColor,
//     color: palettes[theme].color,
//     ...palettes[theme].placeholder,
//     '::selection': {
//       backgroundColor: palettes[theme].selection
//     },
//     ':focus': {
//       borderColor: palettes[theme].focusBorderColor,
//       outline: 'none'
//     },
//     ':active': {
//       borderColor: palettes[theme].focusBorderColor,
//       outline: 'none'
//     }
//   };
// };
//
// const readOnlyStyles = {
//   borderColor: 'transparent',
//   ':focus': {
//     borderColor: 'transparent'
//   },
//   ':active': {
//     borderColor: 'transparent'
//   }
// };
//
// const styleThunk = () => ({
//   field: {
//     appearance: 'none',
//     border: 0,
//     borderBottom: '1px solid transparent',
//     borderRadius: 0,
//     boxShadow: 'none',
//     display: 'block', // Todo: make inlineBlock wrapper (TA)
//     fontFamily: appTheme.typography.sansSerif,
//     fontSize: appTheme.typography.s4,
//     lineHeight: '1.75rem',
//     margin: '0',
//     padding: `.125rem ${ui.fieldPaddingHorizontal}`,
//     width: '100%',
//   },
//
//   cool: makeColorPalette('cool'),
//   gray: makeColorPalette('gray'),
//   warm: makeColorPalette('warm'),
//   white: makeColorPalette('white'),
//
//   disabled: {
//     ...readOnlyStyles,
//     cursor: 'not-allowed'
//   },
//
//   readyOnly: {
//     ...readOnlyStyles,
//     cursor: 'default'
//   },
//
//   fieldLarger: {
//     fontSize: appTheme.typography.s6,
//     fontWeight: 400,
//     lineHeight: '2.625rem',
//   },
//
//   fieldWider: {
//     minWidth: '30rem'
//   },
//
//   inputBlock: {
//     position: 'relative'
//   },
//
//   buttonBlock: {
//     left: '100%',
//     padding: '0 0 0 1rem',
//     position: 'absolute',
//     top: '.375rem'
//   },
//
//   textarea: {
//     minHeight: '6rem'
//   }
// });
//
// export default withStyles(styleThunk)(DropdownField);
