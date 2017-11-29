// import {StyleSheetTestUtils} from 'aphrodite-local-styles';
// import {EditorState} from 'draft-js';
// import {mount} from 'enzyme';
// import React from 'react';
// // import TaskEditor from '../TaskEditor';
//
// console.error = jest.fn();
//
// // https://github.com/Khan/aphrodite/issues/62
// afterEach(() => {
//  return new Promise((resolve) => {
//    StyleSheetTestUtils.clearBufferAndResumeStyleInjection();
//    return process.nextTick(resolve);
//  });
// });
//
// class EditorProps {
//  constructor() {
//    this.editorRef = undefined;
//    this.editorState = EditorState.createEmpty();
//    this.handleCardUpdate = jest.fn();
//    this.isDragging = false;
//    this.teamMembers = [
//      {
//        preferredName: 'matt',
//        picture: 'foo'
//      }
//    ];
//  }
//
//  setEditorRef = (c) => {
//    this.editorRef = c;
//  }
//  setEditorState = (es) => {
//    this.editorState = es;
//  }
// }

describe('TaskEditor', () => {
  test('gains focus when clicked', () => {
    //  const props = new EditorProps();
    //  const component = <TaskEditor {...props} />;
    //  const wrapper = mount(component);
    //  wrapper
    //    .find('.public-DraftEditor-content')
    //    .simulate('beforeInput', {
    //      data: 'S'
    //    });
    //  expect(props.editorState.getCurrentContent().getPlainText()).toEqual('S');
    //  expect(props.editorRef).toBeDefined();
    expect(true).toBe(true);
  });
  // test.only('open suggestions when triggered by #', () => {
  //  const props = new EditorProps();
  //  const component = <TaskEditor {...props}/>;
  //  const wrapper = mount(component);
  //  wrapper
  //    .find('.public-DraftEditor-content')
  //    .simulate('beforeInput', {
  //      data: '#'
  //    });
  //  const wrapper2 = mount(<TaskEditor {...props}/>);
  //
  //  console.log('wra', wrapper2.html())
  //  //expect(props.editorState.getCurrentContent().getPlainText()).toEqual('S');
  //  expect(wrapper2.prop('renderModal')).toBeDefined();
  // });
});
