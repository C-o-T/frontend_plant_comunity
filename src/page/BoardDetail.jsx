import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

const BoardDetail = () => {
   //게시글 상세 보기 저장 변수
   const [boardDetail, setBoardDetail] = useState({});
   //boardNum받는거 
   const {boardNum} = useParams();

   console.log(boardNum)

   useEffect(()=>{
      axios
         .get(`/api/boards/boardDetail/${boardNum}`)
         .then(response => setBoardDetail(response.data))
         .catch(error => console.log(error));
   },[]);
   return (
    <div>
      <div>제목 : {boardDetail.title}</div>
      <div>내용 : {boardDetail.content}</div>
    </div>
  )
}

export default BoardDetail