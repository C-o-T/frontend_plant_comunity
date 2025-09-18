import axios from 'axios';
import React, { useEffect, useState } from 'react'

const MyBoardList = () => {
  //게시글 데이터를 받아 변경할 state 변수
  const [getWrite, setGetWrite] = useState([]);

  useEffect(() => {
    //로그인한 회원의 아이디를 받을 변수
    const loginInfo = sessionStorage.getItem('loginInfo')
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
    <div>
        <h2>게시글</h2>
        <table>
          <thead>
            <tr>
              <td>글번호</td>
              <td>제목</td>
              <td>작성자</td>
              <td>작성일</td>
              <td>조회수</td>
              <td>좋아요</td>
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
  )
}

export default MyBoardList