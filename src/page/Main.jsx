import React, { useEffect, useState } from 'react'
import styles from './Main.module.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const nav = useNavigate();

  //인기글 조회를 위한 state 변수
  const [popularBoardList, setPopularBoardList] = useState([]);

  useEffect(() => {
    axios.get('/api/boards')
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
        <h2>인기글</h2>
        <table>
          <thead>
            <tr>
              <td>글 번호</td>
              <td>제목</td>
              <td>작성자</td>
              <td>작성일</td>
              <td>조회수</td>
              <td>좋아요</td>
            </tr>
          </thead>
          <tbody>
            {
              popularBoardList.length === 0
              ?
              <tr>
                <td colSpan={6}>
                  작성된 게시글이 없습니다.
                </td>
              </tr>
              :
              popularBoardList.map((write, i) => {
                return (
                  <tr key={i}
                    onClick={e => nav(`/board/${write.boardNum}`)}
                  >
                    <td>{write.boardNum}</td>
                    <td>{write.title}</td>
                    <td>{write.memId}</td>
                    <td>{write.createDate}</td>
                    <td>{write.readCnt}</td>
                    <td>{write.likeCnt}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Main