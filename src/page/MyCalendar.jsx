import { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './MyCalendar.module.css'
import { v4 as uuidv4 } from 'uuid';
import WateringPlan from '../components/WateringPlan';
import DeletePlan from '../components/DeletePlan';
import CalendarDiary from '../components/CalendarDiary';
import { useNavigate } from 'react-router-dom';
import Holidays from 'date-holidays';
import Weather from '../components/Weather';
import axios from 'axios';

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
  const nav = useNavigate();

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  // 뷰 모드: 'all' (전체), 'diary' (일기만), 'watering' (물주기만)
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    //마이 페이지를 들어갔는데 로그인이 되어있지 않으면
    //홈 화면으로 강제로 리턴
    //로그인한 회원의 아이디를 받을 변수
    const loginInfo = sessionStorage.getItem('loginInfo')
    if(loginInfo === null){
      alert('로그인을 해주세요')
      nav('/')
      return;
    }
  }, []);


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

  // 일기 상태 관리 (DB에서 불러오기)
  const [diaries, setDiaries] = useState([]);
  const [selectedDiary, setSelectedDiary] = useState(null);

  // 일기 목록 조회 (DB에서)
  useEffect(() => {
    if (memId) {
      fetchDiaries();
    }
  }, [memId]);

  const fetchDiaries = () => {
    axios.get(`/api/diaries`, {
      params: { memId: memId }
    })
    .then(res => {
      const diaryData = res.data.map(diary => ({
        ...diary,
        type: 'diary',
        title: `✏️ ${diary.diaryTitle}`,
        start: new Date(diary.diaryDate),
        end: new Date(diary.diaryDate),
        allDay: true,
        color: '#FFD700'
      }));
      setDiaries(diaryData);
    })
    .catch(e => {
      console.log('일기 조회 실패:', e);
    });
  };

  // 한국 공휴일 생성
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const hd = new Holidays('KR'); // 한국 공휴일
    const year = new Date().getFullYear();
    const holidayList = hd.getHolidays(year);

    const holidayEvents = holidayList.map(holiday => ({
      id: `holiday-${holiday.date}`,
      title: holiday.name,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      allDay: true,
      color: '#FF6B6B', // 공휴일은 빨간색으로 표시
      isHoliday: true // 공휴일 구분 플래그
    }));

    setHolidays(holidayEvents);
  }, []);


  // console.log(memId)
  // console.log(sessionStorage);
  // console.log(JSON.parse(sessionStorage.getItem('loginInfo')).memId);

  //이벤트 생성 함수
  const addWateringSchedule = ({ plantName, cycle, numSchedules, color }) => {
    const groupId = uuidv4();
    const start = clickedDate;
    const newEvents = [];

    for (let i = 0 ; i < numSchedules; i++ ) {
      const startDate = moment(start).add(i * cycle, 'days').toDate();

      newEvents.push({
        id:uuidv4(),
        groupId : groupId,
        memId:'',
        title:`💧 ${plantName} 물 주기`,
        start : startDate,
        end : startDate,
        allDay: true,
        color: color
      })
    }

    setEvents((prevEvents) => {
      const safePrevEvents = Array.isArray(prevEvents) ? prevEvents : [];
      return [...safePrevEvents, ...newEvents];
    });
  }

  // 일기 저장 함수 (DB에 저장)
  const saveDiary = ({ title, content }) => {
    const dateStr = moment(clickedDate).format('YYYY-MM-DD');

    axios.post('/api/diaries', {
      memId: memId,
      diaryTitle: title,
      diaryContent: content,
      diaryDate: dateStr
    })
    .then(() => {
      alert('일기가 저장되었습니다.');
      fetchDiaries(); // 일기 목록 갱신
    })
    .catch(e => {
      if (e.response && e.response.status === 409) {
        alert('해당 날짜에 이미 일기가 존재합니다.');
      } else {
        alert('일기 저장에 실패했습니다.');
      }
      console.log('일기 저장 실패:', e);
    });
  };

  // 일기 수정 함수 (DB 업데이트)
  const updateDiary = (diaryId, { title, content }) => {
    axios.put(`/api/diaries/${diaryId}`, {
      diaryTitle: title,
      diaryContent: content
    })
    .then(() => {
      alert('일기가 수정되었습니다.');
      fetchDiaries(); // 일기 목록 갱신
      setSelectedDiary(null);
    })
    .catch(e => {
      alert('일기 수정에 실패했습니다.');
      console.log('일기 수정 실패:', e);
    });
  };

  // 일기 삭제 함수 (DB에서 삭제)
  const deleteDiary = (diaryId) => {
    axios.delete(`/api/diaries/${diaryId}`)
    .then(() => {
      alert('일기가 삭제되었습니다.');
      fetchDiaries(); // 일기 목록 갱신
      setSelectedDiary(null);
    })
    .catch(e => {
      alert('일기 삭제에 실패했습니다.');
      console.log('일기 삭제 실패:', e);
    });
  };

  // 이벤트 스타일 지정 함수
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    // 일기는 특별한 스타일
    if (event.type === 'diary') {
      style.backgroundColor = '#FFD700';
      style.color = '#333';
      style.fontWeight = 'bold';
    }

    return { style };
  };

  // 클릭된 날짜 정보를 저장할 상태
  const [clickedDate, setClickedDate] = useState(null);

  //캘린더 슬롯 선택 핸들러 함수 (날짜 클릭시 호출)
  const handleSelectSlot = (slotInfo) => {
    const clickedDateStr = moment(slotInfo.start).format('YYYY-MM-DD');

    // 해당 날짜에 일기가 있는지 확인
    const existingDiary = diaries.find(
      d => moment(d.start).format('YYYY-MM-DD') === clickedDateStr
    );

    setClickedDate(slotInfo.start);

    // 일기가 있으면 바로 일기 열기, 없으면 선택 모달
    if (existingDiary) {
      setSelectedDiary(existingDiary);
      setIsDiaryOpen(true);
    } else {
      setIsChoiceModalOpen(true);
    }
  }


  //개별 이벤트 삭제 로직
  const deleteSingleEvent = (eventId) => {
    setEvents((prevEvents)=>{return prevEvents.filter((e)=>e.id !== eventId)})
  };

  //그룹 이벤트 삭제 로직
  const deleteEventGroup = (groupId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.groupId !== groupId));
  };


  //이 일정 이후 모든 일정 삭제 로직
  const deleteEventsAfter = (event) => {
    const selectedDate = new Date(event.start);
      setEvents((prevEvents) =>
      prevEvents.filter((e) => {
        // 다른 그룹의 일정은 유지
        if (e.groupId !== event.groupId)
          return true;
        // 같은 그룹이면서 선택된 일정보다 이전 날짜인 일정만 유지
        return new Date(e.start) < selectedDate;
      })
    );
  };


  // 클릭된 이벤트 정보를 상태에 저장
  const [selectedEvent, setSelectedEvent] = useState('');

  //이벤트 선택 핸들러 (삭제 옵션)
  const handleSelectEvent = (event) => {
    // 공휴일은 삭제 모달을 띄우지 않음
    if (event.isHoliday) return;

    // 일기는 일기 모달, 일정은 삭제 모달
    if (event.type === 'diary') {
      setSelectedDiary(event);
      setClickedDate(event.start);
      setIsDiaryOpen(true);
    } else {
      setSelectedEvent(event); // 클릭된 이벤트 정보를 상태에 저장
    }
  };


  // events 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if(events) {
      localStorage.setItem(storageKey, JSON.stringify(events))
    } else {
      localStorage.setItem(storageKey, JSON.stringify([]))
    }
  }, [events,storageKey]);

  // 뷰 모드 순환 함수 (전체 -> 일기만 -> 물주기만 -> 전체)
  const cycleViewMode = () => {
    if (viewMode === 'all') {
      setViewMode('diary');
    } else if (viewMode === 'diary') {
      setViewMode('watering');
    } else {
      setViewMode('all');
    }
  };

  // 표시할 이벤트 필터링
  const displayEvents =
    viewMode === 'diary'
      ? diaries
      : viewMode === 'watering'
      ? events
      : [...events, ...diaries, ...holidays];

  return (
    <div className={styles.container}>
      {/* 날씨 */}
      <div className={styles.weather_section}>
        <Weather />
      </div>

      {/* 뷰 모드 토글 버튼 (순환) */}
      <div>
        <span className={styles.toggle_section} >
          <button
            className={styles.toggle_button}
            onClick={cycleViewMode}
          >
            {viewMode === 'all' && '📅 전체 보기'}
            {viewMode === 'diary' && '✏️ 일기만 보기'}
            {viewMode === 'watering' && '💧 물주기만 보기'}
          </button>
        </span>
      </div>

      {/* 캘린더 */}
      <div className={styles.calendar_div}>
        <Calendar
          localizer={localizer}
          events={displayEvents}
          startAccessor="start"
          endAccessor="end"
          messages={messages}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          views={['month']}
          longPressThreshold={1}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* 선택 모달 (일정 추가 vs 일기 쓰기) */}
      {isChoiceModalOpen && (
        <div className={styles.choice_modal_overlay}>
          <div className={styles.choice_modal}>
            <h3>{moment(clickedDate).format('M월 D일')}</h3>
            <button
              className={styles.choice_button}
              onClick={() => {
                setIsChoiceModalOpen(false);
                setIsInputOpen(true);
              }}
            >
              일정 추가
            </button>
            <button
              className={styles.choice_button}
              onClick={() => {
                setIsChoiceModalOpen(false);
                setIsDiaryOpen(true);
              }}
            >
              일기 쓰기
            </button>
            <button
              className={styles.choice_button_cancel}
              onClick={() => {
                setIsChoiceModalOpen(false);
                setClickedDate(null);
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 일정 추가 모달 */}
      {
        isInputOpen&&
        <WateringPlan
          isOpen={isInputOpen}
          onClose={() => {
            setIsInputOpen(false);
            setClickedDate(null);
          }}
          clickedDate={clickedDate}
          onAddSchedule={addWateringSchedule}
        />
      }

      {/* 일기 작성/수정 모달 */}
      {
        isDiaryOpen && (
          <CalendarDiary
            isOpen={isDiaryOpen}
            onClose={() => {
              setIsDiaryOpen(false);
              setClickedDate(null);
              setSelectedDiary(null);
            }}
            clickedDate={clickedDate}
            existingDiary={selectedDiary}
            onSaveDiary={saveDiary}
            onUpdateDiary={updateDiary}
            onDeleteDiary={deleteDiary}
          />
        )
      }

      {/* 일정 삭제 모달 */}
      {
        selectedEvent && (
        <DeletePlan
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          selectedEvent={selectedEvent}
          deleteSingleEvent={deleteSingleEvent}
          deleteEventsAfter={deleteEventsAfter}
          deleteEventGroup={deleteEventGroup}
        />
        )
      }

    </div>
  )
}

export default MyCalendar




