import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Title from '../common/Title';
import styles from './MyBoardList.module.css';
import dayjs from 'dayjs'

const MyBoardList = () => {
  const nav = useNavigate()
  //게시글 데이터를 받아 변경할 state 변수
  const [getWrite, setGetWrite] = useState([]);

  useEffect(() => {
    //마이 페이지를 들어갔는데 로그인이 되어있지 않으면
    //홈 화면으로 강제로 리턴
    //로그인한 회원의 아이디를 받을 변수
    const loginInfo = sessionStorage.getItem('loginInfo')
    if(loginInfo === null){
      alert('로그인을 해주세요')
      nav('/')
      return;
    }
    const memId = JSON.parse(loginInfo).memId

    //memId에 맞는 게시글 조회
    axios.get(`/api/boards/${memId}` )
    .then(res => {
      console.log(res.data);
      setGetWrite(res.data);
    })
    .catch(e => console.log(e))

  }, []);

  return (
    <div className={styles.container}>
        <Title title="게시글 관리" />
        <table className={styles.boardTable}>
          <thead>
            <tr>
              <th>글번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회수</th>
              <th>좋아요</th>
            </tr>
          </thead>
          <tbody>
            {
              getWrite.length === 0
              ?
              <tr>
                <td colSpan={6}>
                  작성된 게시글이 없습니다.
                </td>
              </tr>
              :
              getWrite.map((write, i) => {
                return (
                  <tr key={i}
                    onClick={e => nav(`/board/detail/${write.boardNum}`)}
                  >
                    <td>{write.boardNum}</td>
                    <td>{write.title}</td>
                    <td>{write.memId}</td>
                    <td>{dayjs(write.createDate).format('YYYY-MM-DD HH:MM:ss')}</td>
                    <td>{write.readCnt}</td>
                    <td>{write.likeCnt}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
  )
}

export default MyBoardList