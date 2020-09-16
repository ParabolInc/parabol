import TemplateScale from '../../../database/types/TemplateScale'

const makePokerTemplateScales = (teamId: string, templateId: string) => {
  return [
    new TemplateScale({
      name: 'T-Shirt Sizes',
      sortOrder: 0,
      values: [
        {color: '#5CA0E5', label: 'XS', value: 1},
        {color: '#5CA0E5', label: 'SM', value: 2},
        {color: '#45E595', label: 'M', value: 3},
        {color: '#E59545', label: 'L', value: 4},
        {color: '#E59545', label: 'XL', value: 5}
      ],
      teamId: teamId,
      templateId: templateId
    }),
    new TemplateScale({
      name: 'Fibonacci',
      sortOrder: 1,
      values: [
        {color: '#5CA0E5', label: '1', value: 1},
        {color: '#5CA0E5', label: '2', value: 2},
        {color: '#45E595', label: '3', value: 3},
        {color: '#45E595', label: '5', value: 5},
        {color: '#45E595', label: '8', value: 8},
        {color: '#E59545', label: '13', value: 13},
        {color: '#E59545', label: '21', value: 21},
        {color: '#E59545', label: '34', value: 34}
      ],
      teamId: teamId,
      templateId: templateId
    }),
    new TemplateScale({
      name: 'Five Fingers',
      sortOrder: 2,
      values: [
        {color: '#5CA0E5', label: '1', value: 1},
        {color: '#5CA0E5', label: '2', value: 2},
        {color: '#45E595', label: '3', value: 3},
        {color: '#E59545', label: '4', value: 4},
        {color: '#E59545', label: '5', value: 5}
      ],
      teamId: teamId,
      templateId: templateId
    })
  ]
}

export default makePokerTemplateScales
