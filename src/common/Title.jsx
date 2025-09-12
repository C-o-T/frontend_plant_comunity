import React from 'react'

const Title = ({title='제목'}) => {
  return (
    <p
      style={{
        'fontSize' : '1.2rem',
        'fontWeight' : '600',
        'paddingBottom' : '3px',
        'marginBottom' : '15px',
        'color' : '#61bd48',
        'letterSpacing' : '5px'
      }}
    >
      {title}
    </p>
  )
}

export default Title