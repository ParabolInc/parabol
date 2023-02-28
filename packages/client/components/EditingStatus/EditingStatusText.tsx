import styled from '@emotion/styled'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import relativeDate from '../../utils/date/relativeDate'
import getRefreshPeriod from '../../utils/getRefreshPeriod'
import Ellipsis from '../Ellipsis/Ellipsis'
import {TimestampType} from './EditingStatus'

const StyledWrapper = styled('span')({
  display: 'block',
  overflow: 'visible',
  overflowWrap: 'break-word'
})

interface Props {
  editors: {preferredName: string}[]
  isEditing: boolean
  timestamp: string
  timestampType: TimestampType
  isArchived?: boolean
}

const useTimeFrom = (timestamp: string) => {
  const makeTimeFrom = useCallback(
    () => relativeDate(timestamp, {smallDiff: 'just now'}),
    [timestamp]
  )
  const [timeFrom, setTimeFrom] = useState(makeTimeFrom)
  const timeoutRef = useRef<number | undefined>()
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setTimeFrom(makeTimeFrom())
    }, getRefreshPeriod(timestamp))
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [makeTimeFrom, timeFrom, timestamp])
  // to update on toggle
  useEffect(() => {
    setTimeFrom(makeTimeFrom())
  }, [timestamp, makeTimeFrom])

  return timeFrom
}

const EditingStatusText = (props: Props) => {
  const {editors, isEditing, timestamp, timestampType, isArchived} = props
  const timestampLabel = timestampType === 'createdAt' ? 'Created ' : 'Updated '
  const timeFrom = useTimeFrom(timestamp)
  if (isArchived) {
    return <span>{`${timestampLabel}${timeFrom}`}</span>
  }
  if (editors.length === 0) {
    if (isEditing) {
      return (
        <span>
          {'Editing'}
          <Ellipsis />
        </span>
      )
    }
    return <span>{`${timestampLabel}${timeFrom}`}</span>
  }
  const editorNames = editors.map((editor) => editor.preferredName)
  // one other is editing
  if (editors.length === 1) {
    const editor = editorNames[0]
    return (
      <StyledWrapper>
        {editor}
        {' is editing'}
        {isEditing ? ' too' : ''}
        <Ellipsis />
      </StyledWrapper>
    )
  }
  if (editors.length === 2) {
    if (isEditing) {
      return (
        <span>
          several people are editing
          <Ellipsis />
        </span>
      )
    }
    return (
      <span>
        {`${editorNames[0]} and ${editorNames[1]} are editing`}
        <Ellipsis />
      </span>
    )
  }
  return (
    <span>
      {'Several people are editing'}
      <Ellipsis />
    </span>
  )
}

export default EditingStatusText
