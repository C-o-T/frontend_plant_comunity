import React, { useEffect, useState } from 'react'
import styles from './Main.module.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CalendarPage from './MyCalendar';
import smartFarmImage from '../assets/images/smart-farm.jpg';

const Main = () => {
  const nav = useNavigate();

  //인기글 조회를 위한 state 변수
  const [popularBoardList, setPopularBoardList] = useState([]);


  //마운트 시 인기글 리스트 조회
  useEffect(() => {
    axios.get('/api/boards')
    .then(res => setPopularBoardList(res.data))
    .catch(e => console.log(e))
  }, []);

  return (
    <div className={styles.container}>
      {/* 왼쪽: 이미지와 소개 */}
      <div className={styles.left_section}>
        <div className={styles.image_wrapper}>
          <img src={smartFarmImage} alt="스마트팜" />
        </div>
        <div className={styles.intro_section}>
          <h2>🌱 스마트팜이란?</h2>
          <p className={styles.intro_description}>
            스마트팜은 정보통신기술(ICT)을 활용하여 작물의 생육환경을
            자동으로 제어하고 최적화하는 첨단 농업 시스템입니다.
          </p>
          <div className={styles.features_grid}>
            <div className={styles.feature_card}>
              <span className={styles.feature_icon}>🌡️</span>
              <h3>온도 관리</h3>
              <p>실시간 모니터링</p>
            </div>
            <div className={styles.feature_card}>
              <span className={styles.feature_icon}>💧</span>
              <h3>습도 제어</h3>
              <p>최적 환경 유지</p>
            </div>
            <div className={styles.feature_card}>
              <span className={styles.feature_icon}>💡</span>
              <h3>조명 관리</h3>
              <p>자동 조명 제어</p>
            </div>
            <div className={styles.feature_card}>
              <span className={styles.feature_icon}>📊</span>
              <h3>데이터 분석</h3>
              <p>생육 데이터 예측</p>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 인기글 */}
      <div className={styles.right_section}>
        <div className={styles.popular_section}>
          <h2>🔥 인기글</h2>
          <div className={styles.table_wrapper}>
            <table className={styles.popular_table}>
              <thead>
                <tr>
                  <td>카데고리</td>
                  <td>제목</td>
                  <td>작성자</td>
                  <td>조회수</td>
                  <td>좋아요</td>
                </tr>
              </thead>
              <tbody>
                {
                  popularBoardList.length === 0
                  ?
                  <tr>
                    <td colSpan={5} className={styles.empty_message}>
                      작성된 게시글이 없습니다.
                    </td>
                  </tr>
                  :
                  popularBoardList.map((write, i) => {
                    return (
                      <tr key={i}
                        onClick={e => nav(`/board/detail/${write.boardNum}`)}
                        className={styles.table_row}
                      >
                        <td>{write.categoryDTO.cateName}</td>
                        <td className={styles.title_cell}>{write.title}</td>
                        <td>{write.memId}</td>
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
      </div>
    </div>
  )
}

export default Main