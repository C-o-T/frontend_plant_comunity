import React, { useEffect, useState } from 'react'
import styles from './Board.module.css'
import Button from '../common/Button'
import Input from '../common/Input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Board = () => {

  //조회한 글 목록 
  const [boardList, setBoardList] =useState([]);

  //페이지 이동하기
  const nav = useNavigate();

  useEffect(() => {
    axios.get('/api/boards')
    .then(res => setBoardList(res.data))
    .catch(e => console.log(e))
  }, [])

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
          <Button title = '글쓰기' onClick = {e => {nav('/write-board')}}/>
        </div>
        <table className = {styles.table}>
          <colgroup>
            <col width={'10%'}/>
            <col width={'10%'}/>
            <col width={'*'}/>
            <col width={'10%'}/>
            <col width={'10%'}/>
            <col width={'10%'}/>
            </colgroup>
          <thead>
            <tr>
              <td>글번호</td>
              <td>말머리</td>
              <td>글제목</td>
              <td>조회수</td>
              <td>추천</td>
              <td>비추천</td>
            </tr>
          </thead>
          <tbody>
            {
              !boardList.length 
              ?
              <tr>
                <td colSpan={6}>등록된 글이 없습니다.</td>
              </tr>
              :
              boardList.map((board, i) => {
                return(
                  <tr key={i}>
                    <td>{board.boardNum}</td>
                    <td>{board.cateName}</td>
                    <td>{board.title}</td>
                    <td>{board.readCnt}</td>
                    <td>{board.likeCnt}</td>
                    <td>{board.disLikeCnt}</td>
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

export default Board