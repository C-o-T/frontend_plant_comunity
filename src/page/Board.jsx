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
  const currentUserId = loginInfo ? JSON.parse(loginInfo).memId : null;

  //조회한 글 목록
  const [boardList, setBoardList] =useState([]);

  //각 게시글의 좋아요 상태를 저장
  const [likedPosts, setLikedPosts] = useState({});

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

  //좋아요 상태 조회
  const fetchLikeStatuses = (boards) => {
    if(!loginInfo || !boards.length) return;

    boards.forEach(board => {
      axios.get(`/api/likes/${board.boardNum}/check`, {
        params: { memId: currentUserId }
      })
      .then(res => {
        setLikedPosts(prev => ({
          ...prev,
          [board.boardNum]: res.data
        }));
      })
      .catch(e => console.log(e));
    });
  }

  //글 목록 조회하기
  useEffect(() => {
    const params = selectedCateNum ? { cateNum: selectedCateNum } : {};
    axios.get('/api/boards/boardList-paging', { params })
    .then(res => {
      setBoardList(res.data.boardList); //글 목록
      setPageData(res.data.boardDTO);// 페이지 정보
      fetchLikeStatuses(res.data.boardList); //좋아요 상태 조회
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
      fetchLikeStatuses(res.data.boardList); //좋아요 상태 조회
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
      fetchLikeStatuses(res.data.boardList); //좋아요 상태 조회
    })
    .catch(e => console.log(e))
  }

  //좋아요 버튼 클릭
  const handleLike = (e, boardNum) => {
    e.stopPropagation(); //부모 요소 클릭 이벤트 방지

    if(!loginInfo) {
      alert('로그인이 필요합니다.');
      return;
    }

    axios.post(`/api/likes/${boardNum}`, {
      memId: currentUserId
    })
    .then(() => {
      //좋아요 상태 토글
      setLikedPosts(prev => ({
        ...prev,
        [boardNum]: !prev[boardNum]
      }));

      //boardList의 해당 게시글 좋아요 카운트 업데이트
      setBoardList(prevList =>
        prevList.map(board =>
          board.boardNum === boardNum
            ? { ...board, likeCnt: board.likeCnt + (likedPosts[boardNum] ? -1 : 1) }
            : board
        )
      );
    })
    .catch(error => {
      console.log(error);
      alert('좋아요 처리에 실패했습니다.');
    });
  }

  //내용 자르는 함수
  const cutText = (text, maxLength = 30) => {
    let confirmText = text.replace(/<\/?p[^>]*>/gi, '')
    if(confirmText.length <= maxLength){return confirmText}
    return confirmText.substring(0, maxLength) + '...';
  }

  //제목 자르는 함수 (15글자 제한)
  const cutTitle = (text, maxLength = 15) => {
    if(text.length <= maxLength){return text}
    return text.substring(0, maxLength) + '...';
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
            <option value="">선택</option>
            <option value="memId">작성자</option>
            <option value="title">제목</option>
            <option value="titleAndContent">제목 + 내용</option>
          </Select>
        </div>
        <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}/>
        <Button title='검색' onClick={handleSearch}/>
        <Button title = '초기화' onClick={() => {
          setSelectedCateNum("");
          setSearchType("");
          setSearchKeyword("");
        }}/>
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
                <div key={i} className = {styles.board} style={boardList.length === 1 ? {width: '230px', padding: '10px'} : {}}>
                  <div className={styles.img_div} onClick={() => {nav(`/board/detail/${board.boardNum}`)}} style={{cursor: 'pointer'}}>
                    {
                      board.imgList.imgUrl === null ?
                      cutText(board.content, maxLength)
                      :
                      <img src = {board.imgList.imgUrl} className={styles.imgSize}/>
                    }
                  </div>
                  <div>
                    <div className={styles.memId} onClick={() => {nav(`/board/detail/${board.boardNum}`)}} style={{cursor: 'pointer'}}>{board.memId}</div>
                    <div className={styles.title} onClick={() => {nav(`/board/detail/${board.boardNum}`)}} style={{cursor: 'pointer'}}>{cutTitle(board.title)}</div>
                    <div className={styles.likeAndComent}>
                      <i
                        className={likedPosts[board.boardNum] ? "bi bi-heart-fill" : "bi bi-heart"}
                        onClick={(e) => handleLike(e, board.boardNum)}
                        style={{cursor: 'pointer', color: likedPosts[board.boardNum] ? 'red' : 'inherit'}}
                      ></i>
                      <span>{board.likeCnt}</span>
                      <span><i className={"bi bi-chat"}></i></span>
                      <span>{board.commentCnt}</span>
                    </div>
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