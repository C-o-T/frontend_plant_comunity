import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../common/Button';

const BoardDetail = () => {
  //게시글 상세 보기 저장 변수
  const [boardDetail, setBoardDetail] = useState({});
  
  //boardNum받는거 
  const {boardNum} = useParams();

  //현재 로그인 정보
  const loginInfo = sessionStorage.getItem('loginInfo');
  const currentUserId = loginInfo ? JSON.parse(loginInfo).memId : null;

  //페이지 이동
  const nav = useNavigate();

  // 상세데이터 조회
  useEffect(()=>{
    axios
    .get(`/api/boards/boardDetail/${boardNum}`)
    .then(response => setBoardDetail(response.data))
    .catch(error => console.log(error));
  },[]);

  // 작성자와 로그인 사용자가 같은지 확인
  const isAuthor = currentUserId && boardDetail.memId === currentUserId;

  // 게시글 삭제
  const deleteBoard = () => {
    if(window.confirm('정말 삭제하시겠습니까?')) {
      axios
        .delete(`/api/boards/${boardNum}`)
        .then(() => {
          alert('삭제되었습니다.');
          nav('/board');
        })
        .catch(error => {
          console.log(error);
          alert('삭제 실패했습니다.');
        });
    }
  }

  //데이터확인
  console.log(boardNum);
  console.log(boardDetail);
   return (
    <div>
       {isAuthor && <Button title={'삭제'} onClick={() => deleteBoard()}/>}
       {isAuthor && <Button title={'수정'} onClick={() => nav(`/update-board/${boardNum}`)}/>}
      <div>제목 : {boardDetail.title}</div>
      <div dangerouslySetInnerHTML={{ __html: boardDetail.content }}/>
    </div>
  )
}

export default BoardDetail