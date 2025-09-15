import React, { useState } from 'react'
import styles from './WriteBoard.module.css'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import axios from 'axios'

const WriteBoard = () => {
   //글쓰기 등록할때 저장 할 변수
   const [insertBoard, setInsertBoard] = useState({
        title : ''
      , content : ''
      , cateNum : ''
   });

   //선택한 이미지 저장하는 변수
   const [img, setImg] = useState(null);

   //파일 데이터가 포함된 것이다라고 정의
   const fileConfig = {headers : {'Content-Type': 'multipart/form-data'}};

   //글쓰기 등록 함수
   const writeBoard = () => {
      //formdata 객체 생성
      const formData = new FormData();

      //formdata에 모든 정보 추가
      formData.append('title', insertBoard.title);
      formData.append('content', insertBoard.content);
      formData.append('cateNum', insertBoard.cateNum);
      //formData에 이미지 추가
      for(const e of img){
         formData.append('img', e);
      }
      console.log(formData.getAll('img'));
   }

   //글쓰기 등록할 때 바뀐 값 저장하는 함수
   const handleBoard = e => {
      setInsertBoard({
         ...insertBoard,
         [e.target.name] : e.target.value
      });
   }
   //글쓰기할때 파일 등록했을때 text에 이미지나오는 함수
   const uploadImg = async() => {
      //formdata 객체 생성
      const formData = new FormData();
      for(const e of img){
         formData.append('img', e);
      }
      try{
         const response = await axios.post('/api/boards',formData,fileConfig);
         const imgUrls = response.data.imageUrls;
      }catch(error){
         console.log(error)
      }
   }
   //데이터 확인
   console.log(insertBoard);
   
   return (
    <div className = 'container'>
      <h2 className = {styles.tag}>글쓰기</h2>
      <div className={styles.head}>
         <div>
            <div>
               <Select size='100%' name = 'cateNum' value = {insertBoard.cateNum} onChange={e => {handleBoard(e)}}>
                  <option value={''}>말머리</option>
                  <option value={'1'}>지식인</option>
                  <option value={'2'}>피드</option>
                  <option value={'3'}>정보공유</option>
               </Select>
            </div>
            <div>
               <Button title={'등록'} onClick = {e => {writeBoard()}}/>
            </div>
         </div>
         <div>
            <Input placeholder = {'제목을 입력하세요.'} size={'100%'} name = 'title' value = {insertBoard.title} onChange={e => {handleBoard(e)}}/>
         </div>
      </div>
      <div className={styles.content}>
         <div>
            <Input type = 'file' accept = "image/*" multiple = {true} onChange = {e => {
               const fileArr = []; //선택한 파일 저장을 위한 변수
               for(let i = 0; i < e.target.files.length; i++){
                  fileArr.push(e.target.files[i]);
               }
               setImg(fileArr);
            }}/>
         </div>
         <textarea className = {styles.textarea} rows={30} name = 'content' value = {insertBoard.content} onChange={e => {handleBoard(e)}}></textarea>
      </div>
    </div>
  )
}

export default WriteBoard