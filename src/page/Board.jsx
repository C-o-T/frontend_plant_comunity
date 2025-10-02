import React, { useEffect, useState } from 'react'
import styles from './Board.module.css'
import Button from '../common/Button'
import Input from '../common/Input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageNextAndPrev from '../components/PageNextAndPrev';
import Select from '../common/Select';

const Board = () => {
  //로그인한 정보 확인
  const loginInfo = sessionStorage.getItem('loginInfo');
  
  //조회한 글 목록 
  const [boardList, setBoardList] =useState([]);

  //페이징 정보 가진 변수
  const [pageData, setPageData] = useState({});

  //페이지 이동하기
  const nav = useNavigate();

  //카테고리 목록
  const [category,setCartegory] = useState([]);

  //선택된 카테고리 번호
  const [selectedCateNum, setSelectedCateNum] = useState(null);

  //검색 조건
  const [searchType, setSearchType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');


  //카테고리 목록 조회하기
  useEffect(() => {
    axios.get('/api/categories')
    .then(res => {
      setCartegory(res.data);
    })
    .catch(e => console.log(e))
  }, []);

  //글 목록 조회하기
  useEffect(() => {
    const params = selectedCateNum ? { cateNum: selectedCateNum } : {};
    axios.get('/api/boards/boardList-paging', { params })
    .then(res => {
      setBoardList(res.data.boardList); //글 목록
      setPageData(res.data.boardDTO);// 페이지 정보

    })
    .catch(e => console.log(e))
  }, [selectedCateNum]);

  //페이지 목록 클릭시 목록 재조회
  const ClickReloadPage = (page) => {
    const params = { nowPage: page };
    if (selectedCateNum) {
      params.cateNum = selectedCateNum;
    }
    if (searchType && searchKeyword) {
      params.searchType = searchType;
      params.searchKeyword = searchKeyword;
    }
    axios.get(`/api/boards/boardList-paging`, { params })
    .then(res => {
      setBoardList(res.data.boardList); //글 목록
      setPageData(res.data.boardDTO);// 페이지 정보

    })
    .catch(e => console.log(e))
  }

  //카테고리 클릭시 해당 카테고리 게시글 조회
  const handleCategoryClick = (cateNum) => {
    setSelectedCateNum(cateNum);
  }

  //검색 버튼 클릭시 검색 조회
  const handleSearch = () => {
    const params = {};
    if (selectedCateNum) {
      params.cateNum = selectedCateNum;
    }
    if (searchType && searchKeyword) {
      params.searchType = searchType;
      params.searchKeyword = searchKeyword;
    }

    axios.get('/api/boards/boardList-paging', { params })
    .then(res => {
      setBoardList(res.data.boardList);
      setPageData(res.data.boardDTO);
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
  console.log(selectedCateNum);
  return (
    <div className='container'>
      <div className = {styles.menu}>
        <ul>
          {
            category.length ?
            category.map((cate, i) => (
              <li key={i} onClick={() => handleCategoryClick(cate.cateNum)}>
                {cate.cateName}
              </li>
            ))
            :
            null
          }
        </ul>
      </div>
      <div className = {styles.category}>
        <div>
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="">전체</option>
            <option value="memId">작성자</option>
            <option value="title">제목</option>
            <option value="titleAndContent">제목 + 내용</option>
          </Select>
        </div>
        <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}/>
        <Button title='검색' onClick={handleSearch}/>
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
                <div key={i} onClick={() => {nav(`/board/detail/${board.boardNum}`)}}>
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