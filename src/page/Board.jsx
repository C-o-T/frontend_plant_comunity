import React, { useEffect, useState } from 'react'
import styles from './Board.module.css'
import Button from '../common/Button'
import Input from '../common/Input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageNextAndPrev from '../components/PageNextAndPrev';

const Board = () => {
  //로그인한 정보 확인
  const loginInfo = sessionStorage.getItem('loginInfo');
  
  //조회한 글 목록 
  const [boardList, setBoardList] =useState([]);

  //페이징 정보 가진 변수
  const [pageData, setPageData] = useState({});

  //페이지 이동하기
  const nav = useNavigate();

 
  
  const [category,setCartegory] = useState([]);

  //글 목록 조회하기
  useEffect(() => {
    axios.get('/api/boards/boardList')
    .then(res => {
      setBoardList(res.data.boardList); //글 목록
      setPageData(res.data.boardDTO);// 페이지 정보
      
    })
    .catch(e => console.log(e))
  }, []);

  //페이지 목록 클릭시 목록 재조회 
  const ClickReloadPage = (page) => {
    axios.get(`/api/boards/boardList`,{params : {nowPage : page}})
    .then(res => {
      setBoardList(res.data.boardList); //글 목록
      setPageData(res.data.boardDTO);// 페이지 정보
      
    })
    .catch(e => console.log(e))
  }

  //내용 자르는 함수
  const cutText = (text, maxLength = 30) => {
    let confirmText = text.replace(/<\/?p[^>]*>/gi, '')
    if(confirmText.length <= maxLength){return confirmText}
    return confirmText.substring(0, maxLength) + '...';
  }

  // 데이터 확인
  console.log(boardList);
  //console.log(pageData);
  return (
    <div className='container'>
      <div className = {styles.menu}>
        <ul>
          <li>정보공유</li>
          <li>피드</li>
          <li>지식인</li>
        </ul>
      </div>
      <div className = {styles.category}>
        <div>카테고리 검색</div>
        <Input/>
        <Button title = '검색'/>
      </div>
      <div className = {styles.board}>
        <div>
          <Button title = '글쓰기' onClick = {e => {
            if(!loginInfo){
              alert('로그인하세요');
              return;
            }
            nav('/write-board');
            }}/>
        </div>
        <div className = {styles.writedBoard}>
          {
            boardList.length ?
            boardList.map((board, i) => {
              const maxLength = 30;
              return(
                <div key={i}>
                  <div>
                    {
                      <div onClick={() => {nav(`/board/detail/${board.boardNum}`)}}>
                        <div className={styles.img_div}>{
                        board.imgList.imgUrl === null ?
                        cutText(board.content, maxLength)
                        :
                        <img src = {board.imgList.imgUrl} className={styles.imgSize}/>
                        }</div>
                        <div>{board.memId}</div>
                        <div>{board.title}</div>
                          <div className={styles.likeAndComent}>
                            <i className={"bi bi-heart"}></i>
                            <span>{board.likeCnt}</span>
                            <span><i className={"bi bi-chat"}></i></span>
                            <span>1</span>
                          </div>
                      </div>                      
                    }
                  </div>
                </div>
              )
            })
            :
            <div>
              등록된 게시글이 없습니다.
            </div>
          }
        </div>
      </div>
      <PageNextAndPrev pageData = {pageData} onClickPage={ClickReloadPage}/>
    </div>
    
  )
}

export default Board