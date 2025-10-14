import React, { useEffect, useState } from 'react';
import styles from './Weather.module.css';
import axios from 'axios';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ latitude: 37.5665, longitude: 126.9780 }); // 기본값: 서울
  const [location, setLocation] = useState('서울');

  // Kakao REST API 키
  const KAKAO_API_KEY = 'dddbbe5f74a903542c46971ec77ba7a1';

  // 로그인한 사용자의 주소로 좌표 가져오기
 useEffect(() => {
  const loginInfo = sessionStorage.getItem('loginInfo');
  console.log('=== Weather 디버깅 ===');
  console.log('1. loginInfo:', loginInfo);

  if (loginInfo) {
    const userInfo = JSON.parse(loginInfo);
    console.log('2. userInfo:', userInfo);
    const userAddress = userInfo.memAddr;
    console.log('3. userAddress:', userAddress);

    if (userAddress && userAddress.trim() !== '') {
      console.log('4. 백엔드 API 호출 시작:', userAddress);
      
      // ✅ axios로 백엔드 호출
      axios.get('http://localhost:8080/api/weather/geocode', {
        params: {
          address: userAddress
        }
      })
      .then(response => {
        console.log('5. Kakao API 응답:', response.data);
        if (response.data.documents && response.data.documents.length > 0) {
          const { x, y, address_name } = response.data.documents[0];
          console.log('6. 좌표:', { latitude: y, longitude: x });
          setCoords({ latitude: parseFloat(y), longitude: parseFloat(x) });
          
          // 시/군/구까지만 추출
          const locationName = address_name.split(' ').slice(0, 2).join(' ');
          console.log('7. 위치명:', locationName);
          setLocation(locationName);
        } else {
          console.log('6. 주소를 찾을 수 없습니다');
        }
      })
      .catch(err => {
        console.error('주소를 좌표로 변환하는데 실패했습니다:', err);
      });
      
    } else {
      console.log('4. 주소가 없거나 비어있음');
      // 기본 위치 설정 (선택)
      setLocation('주소를 등록해주세요');
    }
  } else {
    console.log('2. 로그인 정보 없음');
  }
}, []);

  // 날씨 코드를 한글과 이모지로 변환
  const getWeatherInfo = (code) => {
    const weatherInfo = {
      0: { text: '맑음', emoji: '☀️' },
      1: { text: '대체로 맑음', emoji: '🌤️' },
      2: { text: '부분적으로 흐림', emoji: '⛅' },
      3: { text: '흐림', emoji: '☁️' },
      45: { text: '안개', emoji: '🌫️' },
      48: { text: '짙은 안개', emoji: '🌫️' },
      51: { text: '약한 이슬비', emoji: '🌦️' },
      53: { text: '이슬비', emoji: '🌦️' },
      55: { text: '강한 이슬비', emoji: '🌧️' },
      61: { text: '약한 비', emoji: '🌧️' },
      63: { text: '비', emoji: '🌧️' },
      65: { text: '강한 비', emoji: '⛈️' },
      71: { text: '약한 눈', emoji: '🌨️' },
      73: { text: '눈', emoji: '❄️' },
      75: { text: '강한 눈', emoji: '❄️' },
      80: { text: '소나기', emoji: '🌧️' },
      81: { text: '강한 소나기', emoji: '⛈️' },
      95: { text: '천둥번개', emoji: '⛈️' }
    };
    return weatherInfo[code] || { text: '알 수 없음', emoji: '🌡️' };
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // fetch API 사용 (CORS 이슈 해결) - 현재 날씨 + 주간 예보 포함
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Seoul&forecast_days=8`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        console.log('날씨 API 응답:', data);
        setWeather(data);
        setLoading(false);
      } catch (err) {
        console.error('날씨 정보를 가져오는데 실패했습니다:', err);
        setError('날씨 정보를 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    if (coords.latitude && coords.longitude) {
      fetchWeather();
    }
  }, [coords]);

  if (loading) {
    return <div className={styles.weather_container}>날씨 정보 로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.weather_container}>{error}</div>;
  }

  const weatherInfo = weather?.current ? getWeatherInfo(weather.current.weather_code) : null;

  // 요일 변환 함수
  const getDayName = (dateString) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  return (
    <div className={styles.weather_wrapper}>
      {weather && weather.current && weatherInfo && (
        <>
          {/* 현재 날씨 */}
          <div className={styles.current_weather}>
            <div className={styles.header}>
              <div className={styles.location}>
                <i className="bi bi-geo-alt-fill"></i>
                <span>{location}</span>
              </div>
              <div className={styles.current_time}>
                {new Date().toLocaleString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className={styles.main_weather}>
              <div className={styles.weather_icon}>{weatherInfo.emoji}</div>
              <div className={styles.temp_area}>
                <div className={styles.current_temp}>
                  {Math.round(weather.current.temperature_2m)}<span className={styles.degree}>°</span>
                </div>
                <div className={styles.weather_desc}>{weatherInfo.text}</div>
              </div>
            </div>

            <div className={styles.detail_grid}>
              <div className={styles.detail_card}>
                <div className={styles.detail_icon}>
                  <i className="bi bi-thermometer-half"></i>
                </div>
                <div className={styles.detail_info}>
                  <div className={styles.detail_label}>체감</div>
                  <div className={styles.detail_value}>{Math.round(weather.current.apparent_temperature)}°</div>
                </div>
              </div>

              <div className={styles.detail_card}>
                <div className={styles.detail_icon}>
                  <i className="bi bi-droplet-fill"></i>
                </div>
                <div className={styles.detail_info}>
                  <div className={styles.detail_label}>습도</div>
                  <div className={styles.detail_value}>{weather.current.relative_humidity_2m}%</div>
                </div>
              </div>

              <div className={styles.detail_card}>
                <div className={styles.detail_icon}>
                  <i className="bi bi-wind"></i>
                </div>
                <div className={styles.detail_info}>
                  <div className={styles.detail_label}>풍속</div>
                  <div className={styles.detail_value}>{weather.current.wind_speed_10m}<span>m/s</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* 주간 날씨 */}
          {weather.daily && (
            <div className={styles.weekly_weather}>
              <div className={styles.weekly_title}>주간 날씨</div>
              <div className={styles.weekly_grid}>
                {weather.daily.time.slice(0, 8).map((date, index) => {
                  const dayWeatherInfo = getWeatherInfo(weather.daily.weather_code[index]);
                  const dateObj = new Date(date);
                  return (
                    <div key={index} className={styles.weekly_item}>
                      <div className={styles.weekly_day}>
                        {index === 0 ? '오늘' : getDayName(date)}
                      </div>
                      <div className={styles.weekly_date}>
                        {dateObj.getMonth() + 1}.{dateObj.getDate()}.
                      </div>
                      <div className={styles.weekly_icon}>{dayWeatherInfo.emoji}</div>
                      <div className={styles.weekly_temp}>
                        <span className={styles.temp_max}>{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                        <span className={styles.temp_separator}>/</span>
                        <span className={styles.temp_min}>{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Weather;
