import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import {MenuPosition} from '../../hooks/useCoords'
import useForm from '../../hooks/useForm'
import useMenu from '../../hooks/useMenu'
import {PALETTE} from '../../styles/paletteV3'
import {BBox} from '../../types/animations'
import linkify from '../../utils/linkify'
import Legitity from '../../validation/Legitity'
import BasicInput from '../InputField/BasicInput'
import RaisedButton from '../RaisedButton'

const ModalBoundary = styled('div')({
  color: PALETTE.SLATE_700,
  padding: '.5rem .5rem .5rem 1rem',
  minWidth: '20rem',
  outline: 0
})

const TextBlock = styled('div')({
  // use baseline so errors don't bump it off center
  alignItems: 'top',
  display: 'flex',
  marginBottom: '.5rem'
})

const InputBlock = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
})

const InputLabel = styled('span')({
  display: 'block',
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '40px',
  marginRight: '.5rem'
})

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

interface Props {
  link: string | null

  originCoords: BBox
  removeModal(allowFocus: boolean): void

  handleSubmit({text, href}: {text: string; href: string}): void
  handleEscape(): void

  text: string | null
}

const EditorLinkChangerModal = (props: Props) => {
  const {originCoords, removeModal, link, text, handleSubmit, handleEscape} = props
  const {menuPortal, openPortal} = useMenu(MenuPosition.UPPER_LEFT, {
    isDropdown: true,
    originCoords
  })
  const {setDirtyField, onChange, validateField, fields} = useForm({
    text: {
      getDefault: () => text,
      validate: (value) =>
        new Legitity(value)
          .trim()
          .required()
          .min(1, 'Maybe give it a name?')
          .max(100, 'That name is looking pretty long')
    },
    link: {
      getDefault: () => link,
      validate: (value) =>
        new Legitity(value).test((maybeUrl) => {
          if (!maybeUrl) return 'No link provided'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : undefined
        })
    }
  })
  useEffect(openPortal, [])
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDirtyField()
    const {link: linkRes, text: textRes} = validateField()
    if (!linkRes || linkRes.error || !textRes || textRes.error) return
    const link = linkRes.value as string
    const text = textRes.value as string
    const href = linkify.match(link)![0]!.url
    removeModal(true)
    handleSubmit({text, href})
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as any)) {
      removeModal(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      removeModal(true)
      handleEscape()
    }
  }

  const hasError = !!(fields.text.error || fields.link.error)
  const label = text ? 'Update' : 'Add'
  return menuPortal(
    <ModalBoundary onBlur={handleBlur} onKeyDown={handleKeyDown} tabIndex={-1}>
      <form onSubmit={onSubmit}>
        {text !== null && (
          <TextBlock>
            <InputLabel>{'Text'}</InputLabel>
            <InputBlock>
              <BasicInput {...fields.text} onChange={onChange} autoFocus name='text' />
            </InputBlock>
          </TextBlock>
        )}
        <TextBlock>
          <InputLabel>{'Link'}</InputLabel>
          <InputBlock>
            <BasicInput
              {...fields.link}
              value={fields.link.value === null ? '' : fields.link.value}
              autoFocus={link === null && text !== ''}
              onChange={onChange}
              name='link'
              spellCheck={false}
            />
          </InputBlock>
        </TextBlock>
        <ButtonBlock>
          <RaisedButton disabled={hasError} onClick={onSubmit} palette='mid'>
            {label}
          </RaisedButton>
        </ButtonBlock>
      </form>
    </ModalBoundary>
  )
}

export default EditorLinkChangerModal
