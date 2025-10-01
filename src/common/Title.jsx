import React from 'react'

const Title = ({title='제목'}) => {
  return (
    <h2
      style={{
        fontSize: '1.2rem',
        fontWeight: '600',
        paddingBottom: '3px',
        marginBottom: '0.7rem',
        margin: '0 0 0.7rem 0',
        color: '#2e7d32',
        letterSpacing: '-0.3px'
      }}
    >
      {title}
    </h2>
  )
}

export default Title