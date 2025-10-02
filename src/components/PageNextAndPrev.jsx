import React, { useEffect, useState } from 'react'
import styles from './PageNextAndPrev.module.css'

const PageNextAndPrev = ({pageData, onClickPage}) => {
   const pageArr = Array.from({ length:  pageData.endPage- pageData.beginPage + 1 }, (_, i) => pageData.beginPage + i);

   console.log( "11",  pageArr)
   return (
     <div className={styles.pagination}>
        {pageData.prev && (
          <span
            className={`${styles.pageButton} ${styles.prevButton}`}
            onClick={e => onClickPage(pageData.beginPage - 1)}
          >
            이전
          </span>
        )}
        {
          pageArr.map((page, i) => {
            return(
              <span
                key={i}
                className={`${styles.pageButton} ${pageData.nowPage === page ? styles.activePage : ''}`}
                onClick={e => onClickPage(page)}
              >
                {page}
              </span>
            )
          })
        }
        {pageData.next && (
          <span
            className={`${styles.pageButton} ${styles.nextButton}`}
            onClick={e => onClickPage(pageData.endPage + 1)}
          >
            다음
          </span>
        )}
      </div>
  )
}

export default PageNextAndPrev