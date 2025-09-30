import React, { useEffect, useState } from 'react'

const PageNextAndPrev = ({pageData, onClickPage}) => {
   const pageArr = Array.from({ length:  pageData.endPage- pageData.beginPage + 1 }, (_, i) => pageData.beginPage + i);
   
   console.log( "11",  pageArr)
   return (
     <div>
        {pageData.prev && <span onClick={e => onClickPage(pageData.beginPage - 1)}>이전</span>}
        {
          pageArr.map((page, i) => {
            return(
              <span key={i} onClick={e => onClickPage(page)}>{page}</span>
            )
          })
        }
        {pageData.next && <span onClick={e => onClickPage(pageData.endPage + 1)}>다음</span>}
      </div>
  )
}

export default PageNextAndPrev