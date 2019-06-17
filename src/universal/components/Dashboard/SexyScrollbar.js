// import * as React from 'react'
// import {Scrollbars} from 'react-custom-scrollbars'
// import {css} from 'react-emotion'

// type Props = {|
//   activeColor: string,
//   children: React.Element<*>,
//   color: string
// |}

// type State = {|
//   isHovered: boolean,
//   isScrolling: boolean
// |}

// const thumbVertical = css({
//   borderRadius: '3px',
//   transition: 'opacity .2s ease-in'
// })

// const scrollbarsOuter = {
//   '& > div': {
//     // margin: '0 !important',
//     '::-webkit-scrollbar': {
//       // appearance: 'none',
//       // width: 6
//     },
//     '::-webkit-scrollbar-thumb': {
//       // borderRadius: 3,
//       // backgroundColor: 'rgba(0, 0, 0, 0.3)',
//       visibility: 'hidden'
//     },
//     '::-webkit-scrollbar-thumb:hover': {
//       // backgroundColor: 'rgba(0, 0, 0, 0.5)'
//     },
//     '::-webkit-scrollbar-thumb:window-inactive': {
//       // backgroundColor: 'rgba(0, 0, 0, 0.2)'
//     }
//   }
// }

// class SexyScrollbar extends React.Component<Props, State> {
//   static defaultProps = {
//     color: 'rgba(0, 0, 0, 0.5)'
//   }
//   state = {
//     isHovered: false,
//     isScrolling: false
//   }

//   onMouseEnter = () => {
//     this.setState({isHovered: true})
//   }
//   onMouseLeave = () => {
//     this.setState({isHovered: false})
//   }

//   onScrollStart = () => {
//     this.setState({isScrolling: true})
//   }

//   onScrollStop = () => {
//     this.setState({isScrolling: false})
//   }

//   setScrollRef = (c) => {
//     this.scrollRef = c
//     this.forceUpdate()
//   }

//   render () {
//     const {isHovered, isScrolling} = this.state
//     const {activeColor, children, color} = this.props
//     const thumbStyles = {
//       opacity: isHovered ? 1 : 0,
//       backgroundColor: isScrolling && activeColor ? activeColor : color
//     }
//     console.log('height', this.scrollRef && this.scrollRef.scrollHeight)
//     const scrollbarStyles = css(
//       scrollbarsOuter
//       // {
//       //   '& > div': {
//       //     height: this.scrollRef && `${this.scrollRef.scrollHeight}px !important`
//       //   }
//       // }
//     )
//     return (
//       <Scrollbars
//         className={scrollbarStyles}
//         style={{
//           height: this.scrollRef ? this.scrollRef.scrollHeight : '100%'
//         }}
//         renderThumbVertical={(props) => (
//           <div {...props} className={thumbVertical} style={{...props.style, ...thumbStyles}} />
//         )}
//         onMouseEnter={this.onMouseEnter}
//         onMouseLeave={this.onMouseLeave}
//         onScrollStart={this.onScrollStart}
//         onScrollStop={this.onScrollStop}
//       >
//         {children(this.setScrollRef)}
//       </Scrollbars>
//     )
//   }
// }

// export default SexyScrollbar
