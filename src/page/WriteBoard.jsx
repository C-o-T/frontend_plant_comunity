import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import styles from './WriteBoard.module.css'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import axios from 'axios'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-quill/dist/quill.snow.css'; // 기본 테마
import ReactQuill from 'react-quill'
import { useNavigate } from 'react-router-dom'

   const MyFile = forwardRef((props, ref) => {
      return <Input ref = {ref} {...props}/>
   })
const WriteBoard = () => {
   //로그인한 정보 확인
   const loginInfo = sessionStorage.getItem('loginInfo');
   const currentUserId = loginInfo ? JSON.parse(loginInfo).memId : null;

   //페이지 이동
   const nav = useNavigate();

   //글쓰기 등록할때 저장 할 변수
   const [insertBoard, setInsertBoard] = useState({
        title : ''
      , content : ''
      , cateNum : ''
      , memId : currentUserId
   });

   const quillRef = useRef(null);
   const fileInsert = useRef(null);

   //Quill 에디터에 paste 이벤트 리스너 등록
   useEffect(() => {
      if (quillRef.current) {
         const editor = quillRef.current.getEditor();
         const editorContainer = editor.root;

         editorContainer.addEventListener('paste', handlePaste);

         return () => {
            editorContainer.removeEventListener('paste', handlePaste);
         };
      }
   }, []);

   //선택한 이미지 저장하는 변수
   const [img, setImg] = useState([]);

   //파일 데이터가 포함된 것이다라고 정의
   const fileConfig = {headers : {'Content-Type': 'multipart/form-data'}};

   //글쓰기 등록 함수
   const writeBoard = () => {
      axios
         .post('/api/boards',insertBoard)
         .then(response => {
            console.log('서버 응답:', response.data);
            alert('등록');
            const boardNum = response.data.boardNum || response.data;
            nav(`/board/detail/${boardNum}`);
         })
         .catch(error => console.log(error))
   }

   //글쓰기 등록할 때 바뀐 값 저장하는 함수
   const handleBoard = e => {
      setInsertBoard({
         ...insertBoard,
         [e.target.name] : e.target.value,
      });
   }

   console.log(insertBoard.content.length)
   console.log(insertBoard.content)

   //quill 에디터로만든 내용 저장 
   const handleContentChange = (value) => {
      setInsertBoard(prev => ({
         ...prev,
         content : value
      }))
   }

   //이미지 아이콘 클릭시 어떻게할지 함수
   const handleImgIcon = () => {
      const editor = quillRef.current.getEditor();
      
      editor.focus();
      setTimeout(() => {
         if(fileInsert.current){
         fileInsert.current.value = null;
         fileInsert.current.click();
      }
      },0)
   };

   //공통 이미지 업로드 함수
   const uploadImages = async (files) => {
      if(!files || files.length === 0) return;

      const formData = new FormData();
      files.forEach(file => formData.append('img', file));

      try {
         const response = await axios.post('/api/boards/upload/img', formData, fileConfig);
         const imageUrls = response.data;
         console.log('111', imageUrls);
         const editor = quillRef.current.getEditor();

         imageUrls.forEach(url => {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', url);
            editor.setSelection(range.index + 1);
         });

         setImg(prev => [...prev, ...files.map((file, i) => ({file, url: imageUrls[i]}))]);
      } catch(error) {
         console.log('이미지 업로드 실패 : ', error);
      }
   };

   //파일 선택 핸들러
   const handleFileChange = async(e) => {
      const files = Array.from(e.target.files);
      await uploadImages(files);
      e.target.value = '';
   };

   //붙여넣기 핸들러
   const handlePaste = async (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      const items = clipboardData.items;
      const imageFiles = [];

      for (let i = 0; i < items.length; i++) {
         if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            imageFiles.push(items[i].getAsFile());
         }
      }

      if (imageFiles.length > 0) {
         await uploadImages(imageFiles);
      }
   };

   //quill editor 모듈
   const modules = useMemo(() => ({
      toolbar: {
         container: [
            [{ header: [1, 2, false] }],
            ['bold', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['image'],
            ['clean']
         ],
         handlers: {
            image: handleImgIcon
         }
      },
      clipboard: {
         matchVisual: false
      }
   }), []);  // 빈 deps → 한번만 생성

   const formats = useMemo(() => [
   'header', 'bold', 'underline', 'list', 'bullet', 'image'
   ], []);

   //등록 버튼 활성화 조건
   const isFormValid = insertBoard.title.trim() !== '' &&
                       insertBoard.content.trim() !== '' &&
                       insertBoard.cateNum !== '';

   //데이터 확인
   console.log(insertBoard);
   console.log(img)

   return (
    <div className = 'container'>
      <h2 className = {styles.tag}>글쓰기</h2>
      <div className={styles.head}>
         <div>
            <div>
               <Select size='100%' name = 'cateNum' value = {insertBoard.cateNum} onChange={e => {handleBoard(e)}}>
                  <option value={''}>말머리</option>
                  <option value={1}>지식인</option>
                  <option value={2}>피드</option>
                  <option value={3}>정보공유</option>
               </Select>
            </div>
            <div>
               <Button
                  title={'등록'}
                  onClick = {e => {
                     writeBoard();
                  }}
                  disabled={!isFormValid}
               />
            </div>
         </div>
         <div>
            <Input placeholder = {'제목을 입력하세요.'} size={'100%'} name = 'title' value = {insertBoard.title} onChange={e => {handleBoard(e)}}/>
         </div>
      </div>
      <div className={styles.content}>
         <MyFile className = {styles.file} ref = {fileInsert} type = 'file' accept = "image/jpeg" multiple = {true} onChange = {e => {handleFileChange(e)}}/>
         <ReactQuill ref={quillRef} theme='snow' value={insertBoard.content} onChange={e => handleContentChange(e)}
         modules={modules}
         formats={formats}
         style={{height : '500px'}}
            />
      </div>
    </div>
  )
}

export default WriteBoard