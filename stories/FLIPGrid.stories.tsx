// import {number, withKnobs} from '@storybook/addon-knobs'
// import {storiesOf} from '@storybook/react'
// import React, {Component} from 'react'
// import StoryProvider from './components/StoryProvider'
//
// class Example extends Component {
//   state = {
//     children: [
//       <div>Foo</div>,
//       <div>Foo2</div>
//     ]
//   }
//
//   onClick = () => {
//     this.setState({
//       children: this.state.children.concat(<div>Another foo</div>)
//     })
//   }
//
//   render() {
//     const {children} = this.state
//     return (<StoryProvider>
//         <FLIPGrid cacheKey={1}>
//           {children}
//         </FLIPGrid>
//         <button onClick={this.onClick}>Add foo</button>
//       </StoryProvider>
//     )
//   }
// }
//
// storiesOf('Reflect Phase', module)
//   .addDecorator(withKnobs)
//   .add('placeholder', () => (
//     <Example/>
//   ))
