import React from 'react'
import styles from './Modal.module.css'
import Title from './Title'

//1.size 모달의 크기 지정
//2.title 모달의 제목 지정
//3. children 모달의 내용 app컴포넌트의 <Modal> 이 사이에 쓴 내용 </Modal>
const Modal = ({size='500px', title='title', isOpen=false,  children, onClose=open}) => {

  // const isOpen = false;

  // isOpen이 false면 모달을 닫는다.
  if(!isOpen) {
    return null;
  }

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content} 
           style={{width:size}}
      >
        <div className={styles.modal_title}>
          <button type="button"  className={styles.close_btn} onClick={onClose}>X</button>
          <p>{title}</p>
        </div>
      <div className={styles.content_div}>
        {children}
      </div>
      </div>
      
    </div>
  )
}

export default Modal