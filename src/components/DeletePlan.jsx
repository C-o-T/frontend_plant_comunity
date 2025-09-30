import React from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import styles from './DeletePlan.module.css'

const DeletePlan = ({
  isOpen,
  onClose,
  selectedEvent,
  deleteSingleEvent,
  deleteEventsAfter,
  deleteEventGroup
}) => {
  return (
    <Modal
      size=''
      isOpen={isOpen}
      title='일정 삭제'
      event={selectedEvent}
      onClose={onClose}
    >
      <div className={styles.input_div}>
        <div>일정을 삭제하시겠습니까?</div>
        <Button
          color='tertiary'
          title='이 일정만 삭제'
          size='200px'
          onClick={()=>{
            deleteSingleEvent(selectedEvent.id)
            onClose()
          }}
        />
        <Button
          color='secondary'
          title='이 일정 이후 모두 삭제'
          size='200px'
          onClick={()=>{
            deleteEventsAfter(selectedEvent)
            onClose()
          }}
        />
        <Button
          title='모든 일정을 삭제'
          size='200px'
          onClick={()=>{
            deleteEventGroup(selectedEvent.groupId)
            onClose()
          }}
        />
      </div>
    </Modal>
  )
}

export default DeletePlan