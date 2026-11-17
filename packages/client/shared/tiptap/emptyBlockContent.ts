// pasted HTML could create task & response blocks without content, and pages still hold them
export const emptyBlockContent = JSON.stringify({type: 'doc', content: [{type: 'paragraph'}]})
