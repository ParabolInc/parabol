import {parse} from 'csv-parse/browser/esm'

export const parseCSV = (file: File) => {
  return new Promise<string[][]>((resolve, reject) => {
    if (file.type !== 'text/csv') {
      reject(new Error('Please upload a valid CSV file.'))
      return
    }

    const parser = parse({
      bom: true,
      columns: false,
      skip_empty_lines: true
    })

    const records = [] as string[][]
    parser.on('readable', function () {
      let record: string[]
      while ((record = parser.read()) !== null) {
        records.push(record)
      }
    })
    parser.once('error', function (error) {
      reject(error)
    })
    parser.once('end', function () {
      resolve(records)
    })

    const decoder = new TextDecoder('utf-8')
    file
      .stream()
      .pipeTo(
        new WritableStream({
          write: (chunk, controller) => {
            return new Promise((resolve, reject) => {
              const decoded = decoder.decode(chunk)
              parser.write(decoded, (error) => {
                if (error) {
                  controller.error(error)
                  reject(error)
                } else {
                  resolve()
                }
              })
            })
          },
          close: () => {
            parser.end()
          }
        })
      )
      .catch(reject)
  })
}
