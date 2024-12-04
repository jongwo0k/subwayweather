const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { calculateTravelTime } = require('../controllers/TimeController');
const { getRealTimeSubwayInfo } = require('../controllers/realTimeController');

// API 통합 데이터
router.get('/:departure/:departureLine/:arrival/:transfer?', async (req, res) => {
    const { departure, departureLine, arrival, transfer } = req.params;

    console.log(`API 요청: 출발역=${departure}, 출발호선=${departureLine}, 도착역=${arrival}, 환승역=${transfer || '없음'}`);

    try {
        // 실시간 도착 정보
        const subway = await getRealTimeSubwayInfo(departure);

        // 소요시간 계산
        const travelTime = await calculateTravelTime(departure, departureLine, arrival, transfer);

        // 예상 도착 시간 계산
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + travelTime * 1000).toLocaleTimeString();

        // 도착 시간 기준 날씨 데이터
        const weather = await getWeather(arrival, arrivalTime);

        // 결과 반환
        res.json({ subway, travelTime, arrivalTime, weather });
    } catch (error) {
        console.error('API 데이터 처리 중 오류:', error.message);
        res.status(500).json({ error: '데이터를 처리하는 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
