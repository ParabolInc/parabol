export const getSummaryTable = async <Headers extends readonly string[]>(
  headers: Headers,
  rowData: Record<Headers[number], string>[]
) => {
  return [
    {type: 'paragraph'},
    {
      type: 'details',
      attrs: {open: false},
      content: [
        {type: 'detailsSummary', content: [{type: 'text', text: 'Table View'}]},
        {
          type: 'detailsContent',
          content: [
            {
              type: 'table',
              content: [
                {
                  type: 'tableRow',
                  content: headers.map((text) => ({
                    type: 'tableHeader',
                    attrs: {colspan: 1, rowspan: 1},
                    content: [
                      {
                        type: 'paragraph',
                        content: [{type: 'text', text, marks: [{type: 'bold', attrs: {}}]}]
                      }
                    ]
                  }))
                },
                ...rowData.map((row) => ({
                  type: 'tableRow',
                  content: headers.map((columnName, idx) => {
                    const text = row[columnName as Headers[number]]
                    return {
                      type: 'tableCell',
                      attrs: {colspan: 1, rowspan: 1},
                      content: [
                        {
                          type: 'paragraph',
                          // zero-length strings are not allowed, but we need a paragraph to keep the cell from collapsing
                          content: !text
                            ? []
                            : [
                                {
                                  type: 'text',
                                  text,
                                  marks: idx === 0 ? [{type: 'bold', attrs: {}}] : undefined
                                }
                              ]
                        }
                      ]
                    }
                  })
                }))
              ]
            }
          ]
        }
      ]
    }
  ]
}
