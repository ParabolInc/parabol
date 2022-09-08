import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import relativeDate from '../../utils/date/relativeDate'
import getRefreshPeriod from '../../utils/getRefreshPeriod'
import Ellipsis from '../Ellipsis/Ellipsis'
import {TimestampType} from './EditingStatus'

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
  return timeFrom
}

const EditingStatusText = (props: Props) => {
  const {editors, isEditing, timestamp, timestampType, isArchived} = props

  const {t} = useTranslation()

  const timestampLabel =
    timestampType === 'createdAt' ? t('EditingStatusText.Created') : t('EditingStatusText.Updated')
  const timeFrom = useTimeFrom(timestamp)
  if (isArchived) {
    return (
      <span>
        {t('EditingStatusText.TimestampLabelTimeFrom', {
          timestampLabel,
          timeFrom
        })}
      </span>
    )
  }
  if (editors.length === 0) {
    if (isEditing) {
      return (
        <span>
          {t('EditingStatusText.Editing')}
          <Ellipsis />
        </span>
      )
    }
    return (
      <span>
        {t('EditingStatusText.TimestampLabelTimeFrom', {
          timestampLabel,
          timeFrom
        })}
      </span>
    )
  }
  const editorNames = editors.map((editor) => editor.preferredName)
  // one other is editing
  if (editors.length === 1) {
    const editor = editorNames[0]
    return (
      <span>
        {editor}
        {t('EditingStatusText.IsEditing')}
        {isEditing ? ' too' : ''}
        <Ellipsis />
      </span>
    )
  }
  if (editors.length === 2) {
    if (isEditing) {
      return (
        <span>
          {t('EditingStatusText.SeveralPeopleAreEditing')}
          <Ellipsis />
        </span>
      )
    }
    return (
      <span>
        {t('EditingStatusText.EditorNames0AndEditorNames1AreEditing', {
          editorNames0: editorNames[0],
          editorNames1: editorNames[1]
        })}
        <Ellipsis />
      </span>
    )
  }
  return (
    <span>
      {t('EditingStatusText.SeveralPeopleAreEditing')}
      <Ellipsis />
    </span>
  )
}

export default EditingStatusText
