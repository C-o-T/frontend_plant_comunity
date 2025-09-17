import React from 'react'
import styles from './Select.module.css'
//children = option 내용
//size = select 크기
//props = onChange value name 기타 등등
const Select = ({children, size = '100px', ...props}) => {
  return (
    <select className = {styles.select} style={{width : `${size}`}} {...props}>
        {children}
    </select>
  )
}

export default Select