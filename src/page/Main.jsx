import React, { useEffect, useState } from 'react'
import styles from './Main.module.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
          <div className={styles.popular_header}>
            <h2>🔥 인기글</h2>
            <button 
              className={styles.more_btn}
              onClick={() => nav('/board')}
            >
              더보기 →
            </button>
          </div>
          
          <div className={styles.popular_list}>
            {
              popularBoardList.length === 0
              ?
              <div className={styles.empty_state}>
                <span className={styles.empty_icon}>📝</span>
                <p>작성된 게시글이 없습니다.</p>
              </div>
              :
              popularBoardList.map((write, i) => {
                return (
                  <div 
                    key={i}
                    className={styles.popular_card}
                    onClick={() => nav(`/board/detail/${write.boardNum}`)}
                  >
                    <div className={styles.card_header}>
                      <span className={styles.category_badge}>
                        {write.categoryDTO.cateName}
                      </span>
                      <div className={styles.card_stats}>
                        <span className={styles.stat_item}>
                          👁️ {write.readCnt}
                        </span>
                        <span className={styles.stat_item}>
                          ❤️ {write.likeCnt}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className={styles.card_title}>{write.title}</h3>
                    
                    <div className={styles.card_footer}>
                      <span className={styles.author}>
                        👤 {write.memId}
                      </span>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main