import React from 'react'
import styles from './Button.module.css'
// title = 버튼 이름 
// size = 버튼 크기?
// props onclick 기타 등등

const Button = ({title, size = '100px', color='primary', onClick, ...props}) => {
  return (
    <div>
      <button className = {`${styles.btn} ${styles[color]} ${props.disabled && styles.disabled}`} 
        type='button' 
        style={{width : size}} 
        onClick={onClick}
        {...props}
      >
        {title}
      </button>
    </div>

  )
}

export default Button