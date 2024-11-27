// 모듈 불러오기
require('dotenv').config();
const express = require('express');
const axios = require('axios');

// 서버 설정
const app = express();
const port = process.env.PORT || 3000; // .env에 PORT가 없으면 3000번 포트 사용

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello, SubwayWeather!'); // 나중에 html 문서로 변경
});

// 날짜 함수
const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`; // YYYYMMDD
};

// 시간 함수
const getBaseTime = () => {
    const date = new Date();
    const hours = date.getHours();

    // 시간 간격 조정 (3시간)
    if (hours >= 2 && hours < 5) return '0200';
    if (hours >= 5 && hours < 8) return '0500';
    if (hours >= 8 && hours < 11) return '0800';
    if (hours >= 11 && hours < 14) return '1100';
    if (hours >= 14 && hours < 17) return '1400';
    if (hours >= 17 && hours < 20) return '1700';
    if (hours >= 20 && hours < 23) return '2000';
    return '2300'; // 기본값
};

// 날씨 API 테스트
app.get('/weather', async (req, res) => {
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const weatherEndPoint = process.env.WEATHER_API_ENDPOINT;
    const baseDate = getFormattedDate();
    const baseTime = getBaseTime();

    const url = `${weatherEndPoint}/getUltraSrtFcst?serviceKey=${weatherApiKey}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=60&ny=127`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).send("Failed to fetch weather data");
    }
});

// 지하철 API 테스트
app.get('/subway/:station', async (req, res) => {
    const subwayApiKey = process.env.SUBWAY_API_KEY;
    const station = req.params.station;
    const url = `http://swopenAPI.seoul.go.kr/api/subway/${subwayApiKey}/json/realtimeStationArrival/0/5/${encodeURIComponent(station)}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching subway data:", error);
        res.status(500).send("Failed to fetch subway data");
    }
});

// 서버 실행
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});