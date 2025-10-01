import React from 'react'
import Title from '../common/Title'
import styles from './AdminQnA.module.css'

const AdminQnA = () => {
  return (
    <div className={styles.container}>
      <Title title="1:1 문의 관리" />
      <div className={styles.emptyState}>
        <p>문의 내역이 없습니다.</p>
      </div>
    </div>
  )
}

export default AdminQnA