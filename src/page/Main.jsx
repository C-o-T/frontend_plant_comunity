import React, { useEffect, useState } from 'react'
import styles from './Main.module.css'
import axios from 'axios';

const Main = () => {
  //인기글 조회를 위한 state 변수
  const [popularBoardList, setPopularBoardList] = useState([]);

  console.log(popularBoardList)

  //마운트 시 인기글 리스트 조회
  useEffect(() => {
    axios.get('/api/boards/popular')
    .then(res => setPopularBoardList(res.data))
    .catch(e => console.log(e))

  }, []);


  return (
    <div className={styles.container}>
      <div className={styles.img_div}>
        <div>이미지</div>
        <div>스마트팜 정보</div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>인기글 제목</td>
          </tr>
        </thead>
        <tbody>
          {
            popularBoardList.map((board, i) => {
              return(
                <tr key={i}>
                  <td>{board.title}</td>
                  <td>{board.read}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default Main