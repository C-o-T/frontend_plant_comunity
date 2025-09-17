import React, { useEffect, useState } from 'react'
import styles from './Main.module.css'
import axios from 'axios';

const Main = () => {
  //게시글 조회를 위한 state 변수
  const [boardList, setBoardList] = useState([]);

  //인기글 조회를 위한 state 변수
  const [popularBoardList, setPopularBoardList] = useState([]);

  useEffect(() => {
    axios.get()
    .then(res => setBoardList(res.data))
    .catch(e => console.log(e))

    axios.get()
    .then(res => setPopularBoardList(res.data))
    .catch(e => console.log(e))

  }, []);


  return (
    <div className='container'>Main(로그인X 첫화면 사이트소개, 최신글, 인기글 클릭시: 로그인하세요 안내
      로그인O 첫화면 내농장요약, 최신글, 인기글)
      <div>
        <div>이미지</div>
        <div>정보</div>
      </div>
      <div>
        인기글
      </div>
    </div>
  )
}

export default Main