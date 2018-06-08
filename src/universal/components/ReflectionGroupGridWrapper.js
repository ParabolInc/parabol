// import * as React from 'react'
// import styled from 'react-emotion'
// import {GRID_ROW_HEIGHT} from 'universal/components/PhaseItemMasonry'
// import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
//
// const CardWrapper = styled('div')(({height}) => ({
//   position: 'relative',
//   listStyleType: 'none',
//   // maxWidth: 304,
//   display: 'inline-block',
//   gridRowEnd: `span ${Math.ceil(height / GRID_ROW_HEIGHT)}`
// }))
//
// class ReflectionGroupGridWrapper extends React.Component {
//   state = {
//     height: 0
//     // count: 0
//   }
//
//   componentDidMount () {
//     this.count = this.props.reflectionCount
//     this.setState({
//       height: this.ref.scrollHeight
//       // count: this.props.reflectionCount
//     })
//   }
//
//   componentDidUpdate () {
//     if (this.props.reflectionCount !== this.count) {
//       this.count = this.props.reflectionCount
//       setTimeout(() => {
//         if (!this.ref) return
//         this.setState({
//           height: this.ref.scrollHeight
//         })
//       })
//     }
//   }
//
//   setRef = (c) => {
//     this.ref = c
//   }
//
//   render () {
//     const {meeting, reflectionGroup} = this.props
//     if (!reflectionGroup) return null
//     return (
//       <CardWrapper height={this.state.height}>
//         <ReflectionGroup
//           innerRef={this.setRef}
//           meeting={meeting}
//           reflectionGroup={reflectionGroup}
//         />
//       </CardWrapper>
//     )
//   }
// }
//
// export default ReflectionGroupGridWrapper
