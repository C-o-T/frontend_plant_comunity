import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../common/Button';
import styles from './BoardDetail.module.css';

const BoardDetail = () => {
  //게시글 상세 보기 저장 변수
  const [boardDetail, setBoardDetail] = useState({});

  //좋아요 상태 저장 변수
  const [isLiked, setIsLiked] = useState(false);

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

  // 좋아요 버튼 클릭
  const handleLike = () => {
    if(!loginInfo) {
      alert('로그인이 필요합니다.');
      return;
    }
    setIsLiked(!isLiked);
    // 좋아요 API 호출 (필요시)
    // axios.post(`/api/boards/${boardNum}/like`)
  }

  //데이터확인
  console.log(boardNum);
  console.log(boardDetail);
   return (
    <div className={styles.main}>
      <div className={styles.tag}>게시글 상세</div>
      <div className={styles.head}>
        <div>
          <h2>{boardDetail.title}</h2>
          <div className={styles.button_group}>
            {isAuthor && <Button title={'수정'} onClick={() => nav(`/update-board/${boardNum}`)}/>}
            {isAuthor && <Button title={'삭제'} onClick={() => deleteBoard()}/>}
          </div>
        </div>
        <div className={styles.meta_info}>
          <span>작성자: {boardDetail.memId}</span>
          <span>작성일: {boardDetail.createDate}</span>
          <span>조회수: {boardDetail.readCnt}</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.content_body} dangerouslySetInnerHTML={{ __html: boardDetail.content }}/>
      </div>

      <div className={styles.footer}>
        <div className={styles.like_section}>
          <button
            className={`${styles.like_button} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            <i className={isLiked ? "bi bi-heart-fill" : "bi bi-heart"}></i>
            <span>{boardDetail.likeCnt || 0}</span>
          </button>
        </div>
        <div className={styles.action_buttons}>
          <Button title="목록" onClick={() => nav('/board')} />
        </div>
      </div>
    </div>
  )
}

export default BoardDetail