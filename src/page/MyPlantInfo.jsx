import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Select from '../common/Select';
import Title from '../common/Title';
import styles from './MyPlantInfo.module.css'


const MyPlantInfo = () => {
  const nav = useNavigate();

  //식물 정보를 변경할 state 변수
  const [plantList, setPlantList] = useState([]);

  //선택한 식물 정보 조회할 변수
  const [selectedPlant, setSelectedPlant] = useState(null);
  
  //최근 식물 데이터를 받을 state 변수
  const [lastSensorData, setLastSensorData] = useState(null);

  //기기 작동 로그를 받을 state 변수
  const [logList, setLogList] = useState([]);

  //표시할 로그 개수 state 변수
  const [displayCount, setDisplayCount] = useState(5);

  console.log(logList)

  //식물 선택했을때 데이터 바뀌는 함수
  const handlePlant = (e) => {
    const herbName = e.target.value;
    const plant = plantList.find(p => p.herbName === herbName);
    setSelectedPlant(plant);
  }

  //마운트시 식물 정보 조회 및 최근 환경데이터 조회
  useEffect(() => {
    //마이팜 페이지를 들어갔는데 로그인이 되어있지 않으면
    //홈 화면으로 강제로 리턴
    const loginInfo = sessionStorage.getItem('loginInfo')
    if(loginInfo === null){
      alert('로그인을 해주세요')
      nav('/')
      return;
    }

    //식물 리스트 조회
    axios.get('/api/plants')
    .then(res => setPlantList(res.data))
    .catch(e => console.log(e))

    //최신 환경 데이터 조회
    axios.get('/api/sensor/last')
    .then(res => setLastSensorData(res.data))
    .catch(e => console.log(e));

    //로그 리스트 조회
    axios.get('/api/logs')
    .then(res => setLogList(res.data))
    .catch(e => console.log(e))
  }, []);

  // 현재 환경이 적정 범위에 속하는지 확인하는 함수
  const checkSuitabilityDetails = () => {
    if (!selectedPlant || !lastSensorData) return null;

    const { tempMin, tempMax, humidMin, humidMax, luxMin, luxMax, soilMin, soilMax } = selectedPlant;
    const { temperature, humidity, illuminance, soilMoisture } = lastSensorData;

    return {
      temperature: temperature >= tempMin && temperature <= tempMax ? "적합" : "부적합",
      humidity: humidity >= humidMin && humidity <= humidMax ? "적합" : "부적합",
      illuminance: illuminance >= luxMin && illuminance <= luxMax ? "적합" : "부적합",
      soilMoisture: soilMoisture >= soilMin && soilMoisture <= soilMax ? "적합" : "부적합",
    };
  };

  const calculateRunTimes = (logs) => {
    const runTimes = [];
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.eventTime) - new Date(b.eventTime)
    );

    const deviceStates = {};

    sortedLogs.forEach((log) => {
      const device = log.actName;

      if (log.state === "ON") {
        if (!deviceStates[device]) {
          deviceStates[device] = new Date(log.eventTime);
        }
      } else if (log.state === "OFF" && deviceStates[device]) {
        const onTime = deviceStates[device];
        const offTime = new Date(log.eventTime);
        const durationSec = Math.floor((offTime - onTime) / 1000);

        runTimes.push({
          device,
          onTime: onTime.toLocaleString(),
          offTime: offTime.toLocaleString(),
          duration: durationSec,
        });

        delete deviceStates[device];
      }
    });

    return runTimes;
  };


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 좌측 상단: 식물 정보 */}
        <div className={styles.herb_info}>
          <Title title="식물 정보" />
          <Select onChange={handlePlant}>
            <option value="">선택</option>
            {plantList.map((plant, i) => (
              <option key={i} value={plant.herbName}>
                {plant.herbName}
              </option>
            ))}
          </Select>

          {selectedPlant ? (
            <div className={styles.plant}>
              <h1>{selectedPlant.herbName}</h1>
              <div>
                <img src={selectedPlant.imgName} alt={selectedPlant.herbName}/>
                <div className={styles.data}>
                  <div>
                    <p>적정 온도</p>
                    <p>{selectedPlant.tempMin} ~ {selectedPlant.tempMax}℃</p>
                  </div>
                  <div>
                    <p>적정 습도</p>
                    <p>{selectedPlant.humidMin} ~ {selectedPlant.humidMax}%</p>
                  </div>
                  <div>
                    <p>적정 조도</p>
                    <p>{selectedPlant.luxMin} ~ {selectedPlant.luxMax}</p>
                  </div>
                  <div>
                    <p>적정 토양습도</p>
                    <p>{selectedPlant.soilMin} ~ {selectedPlant.soilMax}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.empty_message}>
              <p>🌱</p>
              <p>식물을 선택하세요</p>
            </div>
          )}
        </div>

        {/* 좌측 하단: 상태 */}
        <div className={styles.status_section}>
          <Title title="상태" />
          {selectedPlant && lastSensorData ? (
            <div>
              <div className={styles.overall_status}>
                {Object.values(checkSuitabilityDetails()).every(v => v === "적합") ? (
                  <div className={styles.status_badge_good}>
                    <span className={styles.status_icon}>✅</span>
                    <span>전체 상태: 적합</span>
                  </div>
                ) : (
                  <div className={styles.status_badge_bad}>
                    <span className={styles.status_icon}>⚠️</span>
                    <span>전체 상태: 부적합</span>
                  </div>
                )}
              </div>
              <div className={styles.status_grid}>
                <div className={`${styles.status_card} ${checkSuitabilityDetails().temperature === "적합" ? styles.good : styles.bad}`}>
                  <div className={styles.status_label}>온도</div>
                  <div className={styles.status_value}>{lastSensorData.temperature}℃</div>
                  <div className={styles.status_range}>
                    적정: {selectedPlant.tempMin}~{selectedPlant.tempMax}℃
                  </div>
                  <div className={styles.status_result}>
                    {checkSuitabilityDetails().temperature === "적합" ? "✓ 적합" : "✗ 부적합"}
                  </div>
                </div>

                <div className={`${styles.status_card} ${checkSuitabilityDetails().humidity === "적합" ? styles.good : styles.bad}`}>
                  <div className={styles.status_label}>습도</div>
                  <div className={styles.status_value}>{lastSensorData.humidity}%</div>
                  <div className={styles.status_range}>
                    적정: {selectedPlant.humidMin}~{selectedPlant.humidMax}%
                  </div>
                  <div className={styles.status_result}>
                    {checkSuitabilityDetails().humidity === "적합" ? "✓ 적합" : "✗ 부적합"}
                  </div>
                </div>

                <div className={`${styles.status_card} ${checkSuitabilityDetails().illuminance === "적합" ? styles.good : styles.bad}`}>
                  <div className={styles.status_label}>조도</div>
                  <div className={styles.status_value}>{lastSensorData.illuminance} Lux</div>
                  <div className={styles.status_range}>
                    적정: {selectedPlant.luxMin}~{selectedPlant.luxMax}
                  </div>
                  <div className={styles.status_result}>
                    {checkSuitabilityDetails().illuminance === "적합" ? "✓ 적합" : "✗ 부적합"}
                  </div>
                </div>

                <div className={`${styles.status_card} ${checkSuitabilityDetails().soilMoisture === "적합" ? styles.good : styles.bad}`}>
                  <div className={styles.status_label}>토양습도</div>
                  <div className={styles.status_value}>{lastSensorData.soilMoisture}%</div>
                  <div className={styles.status_range}>
                    적정: {selectedPlant.soilMin}~{selectedPlant.soilMax}%
                  </div>
                  <div className={styles.status_result}>
                    {checkSuitabilityDetails().soilMoisture === "적합" ? "✓ 적합" : "✗ 부적합"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.empty_message}>
              <p>📊</p>
              <p>선택된 식물 정보 없음</p>
            </div>
          )}
        </div>

        {/* 우측: 장치 가동 로그 */}
        <div className={styles.log_section}>
          <Title title="장치 가동 로그" />
          {selectedPlant ? (
            <>
              <div className={styles.log_list}>
                {calculateRunTimes(logList)
                  .reverse()
                  .slice(0, displayCount)
                  .map((log, i) => (
                    <div key={i} className={styles.log_item}>
                      [{log.device}] {log.onTime} ~ {log.offTime} → 가동시간: {log.duration}초
                    </div>
                  ))}
              </div>
              {calculateRunTimes(logList).length > displayCount && (
                <button
                  className={styles.load_more_btn}
                  onClick={() => setDisplayCount(prev => prev + 10)}
                >
                  더보기 ({displayCount} / {calculateRunTimes(logList).length})
                </button>
              )}
            </>
          ) : (
            <div className={styles.empty_message}>
              <p>
                <p>📝</p>
                <p>선택된 식물 정보 없음</p>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyPlantInfo