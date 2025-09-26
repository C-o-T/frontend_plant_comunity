import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './MyCalendar.module.css'
import Select from '../common/Select'
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Modal from '../common/Modal';

//moment 로컬라이저 설정
moment.locale("ko"); //한국어로 설정
const localizer = momentLocalizer(moment);
//한국어 메시지 설정
const messages = {
  allDay:'종일',
  previous:'이전',
  next:'다음',
  today:'오늘',
  month:'월',
  week:'주',
  day:'일',
  agenda:'일정',
  data:'날짜',
  time:'시간',
  event:'일정'
}


const MyCalendar = () => {


  const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo') || '{}');
  //현재 로그인된 사용자 ID 가져오기
  const memId = loginInfo.memId;
  //memId를 기반으로 고유 키 생성
  const storageKey = `wateringEvents_${memId}`

  //localStorage에서 해당 사용자의 데이터를 불러와 상태를 초기화
  const [events, setEvents] = useState(() => {
    const savedEventsString = localStorage.getItem(storageKey);
    if (savedEventsString && savedEventsString !== 'undefined') {
      // JSON 문자열을 객체로 변환
      const parsedEvents = JSON.parse(savedEventsString);

      // start와 end 필드를 Date 객체로 변환
      return parsedEvents.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
    }
    return [];
  });

  
  // console.log(memId)
  // console.log(sessionStorage);
  // console.log(JSON.parse(sessionStorage.getItem('loginInfo')).memId);

  //선택된 관수 주기를 관리할 상태 추가
  const [selectedCycle, setSelectedCycle] = useState('');
  
  //식물 이름을 입력받을 상태 추가(이벤트 제목)
  const [plantName, setPlantName] = useState('');

  //console.log(selectedCycle)
  //console.log(plantName)

  //이벤트 생성 함수
  const addWateringSchedule = () => {
    const groupId = uuidv4(); // 이 그룹의 모든 이벤트에 동일하게 부여될 고유 ID
    const today = new Date();
    const newEvents = [];
    const numSchedules = 10; //10회 생성
    const cycle = parseInt(selectedCycle, 10);

    if (cycle === 0) {
      alert('유효한 주기를 선택하세요.');
      return;
    }

    for (let i = 0 ; i < numSchedules; i++ ) {
      const startDate = moment(today).add(i * cycle, 'days').toDate();
      

      newEvents.push({
        id:uuidv4(), //각 이벤트의 고유 ID
        groupId : groupId, //그룹의 모든 이벤트에 동일하게 부여될 고유 ID
        memId:'',
        title:`${plantName} 물 주기`,
        start : startDate,
        end : startDate,
        allDay: true
      })
    }

    setEvents((prevEvents) => {
      // prevEvents가 배열이 아니면 빈 배열로 초기화
      const safePrevEvents = Array.isArray(prevEvents) ? prevEvents : [];
      return [...safePrevEvents, ...newEvents];
    });

    setPlantName('');
    setSelectedCycle(0);
  }

  //개별 이벤트 삭제 로직
  const deleteSingleEvent = (eventId) => {
    setEvents((prevEvents)=>{return prevEvents.filter((e)=>e.id !== eventId)})
  };

  //그룹 이벤트 삭제 로직
  const deleteEventGroup = (groupId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.groupId !== groupId));
  };

  // 클릭된 이벤트 정보를 상태에 저장
  const [selectedEvent, setSelectedEvent] = useState('');

  //이벤트 선택 핸들러 (삭제 옵션)
  const handleSelectEvent = (event) => {
    setSelectedEvent(event); // 클릭된 이벤트 정보를 상태에 저장
  };
  

  // events 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if(events) {
      localStorage.setItem(storageKey, JSON.stringify(events))
    } else {
      localStorage.setItem(storageKey, JSON.stringify([]))
    }
  }, [events,storageKey]);
  

  return (
    <div className={styles.container}>
      <div className={styles.calendar_div}>
        <Calendar 
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{height:500}}
          messages={messages}
          onSelectEvent={handleSelectEvent}
        />
      </div>
      <div>
        <div>
          <Input 
            type='text'
            placeholder='식물 이름을 입력해주세요.'
            value={plantName}
            onChange={e=>setPlantName(e.target.value)}
          />
          <Select
            size='120px'
            value={selectedCycle}
            onChange={e=>setSelectedCycle(e.target.value)}
          >
            <option value='0'>주기 선택</option>
            <option value='3'>3일</option>
            <option value='5'>5일</option>
            <option value='7'>7일</option>
            <option value='10'>10일</option>
            <option value='14'>14일</option>
          </Select>
          <Button 
            title='물주기스케쥴추가'
            onClick={e=>addWateringSchedule(e)}
          />
        </div>
        {
          selectedEvent && (
            <Modal
              isOpen={!!selectedEvent}
              title='일정 삭제'
              event={selectedEvent}
              onClose={()=>{
                setSelectedEvent(null);
              }}
            >
              <div>일정을 삭제하시겠습니까?</div>
              <Button
                color='secondary'
                title='이 일정만 삭제'
                onClick={()=>{
                  deleteSingleEvent(selectedEvent.id)
                  setSelectedEvent(null)
                }}
              />
              <Button
                title='모든 일정을 삭제'
                onClick={()=>{
                  deleteEventGroup(selectedEvent.groupId)
                  setSelectedEvent(null)
                }}
              />
            </Modal>
          )
        }
      </div>
      
    </div>
  )
}

export default MyCalendar



