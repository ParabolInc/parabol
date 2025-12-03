import {parse} from 'csv-parse/browser/esm'
import {useRef} from 'react'
import {Button} from '../ui/Button/Button'

const parseCSV = (file: File) => {
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

type Props = {
  onRecordsParsed: (records: string[][]) => void
  onError: (error: Error | null) => void
}

export const UploadCSV = (props: Props) => {
  const {onRecordsParsed, onError} = props

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)

  const startImport = async (file: File) => {
    onError(null)
    fileRef.current = file
    try {
      const records = await parseCSV(file)
      onRecordsParsed(records)
    } catch (error) {
      onError(error as Error)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLFormElement>) => {
    const {files} = e.currentTarget
    const file = files ? files[0] : null
    if (!file) return
    startImport(file)
  }

  const onChooseFile = () => {
    if (!fileInputRef.current) return
    // let the user upload the same file again
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setAttribute('data-drop', '')
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.removeAttribute('data-drop')
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    startImport(file)
  }

  return (
    <div className='mb-3 text-left font-semibold text-slate-600 text-sm'>
      Upload a CSV into the database.
      <input className='hidden' ref={fileInputRef} type='file' accept='.csv' onChange={onChange} />
      <div
        className={
          'mt-3 flex h-50 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-slate-400 border-dashed bg-slate-50 text-slate-500 hover:border-slate-600 data-drop:border-slate-600 data-drop:bg-slate-100'
        }
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Button
          shape='pill'
          variant='dialogPrimary'
          className='m-2 px-6 py-2'
          onClick={onChooseFile}
        >
          Browse
        </Button>
        <span> or drop a CSV file here.</span>
      </div>
    </div>
  )
}
