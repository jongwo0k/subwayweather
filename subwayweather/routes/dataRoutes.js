const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { getRealTimeSubwayInfo } = require('../controllers/realTimeController');
const { calculateTravelTime } = require('../controllers/timeController');

// API 통합 데이터
router.get('/:departure/:departureLine/:arrival/:transfer?', async (req, res) => {
    const { departure, departureLine, arrival, transfer } = req.params;

    console.log(`[API 요청]: 출발역=${departure}, 출발호선=${departureLine}, 도착역=${arrival}, 환승역=${transfer || '없음'}`);

    try {
        // 출발역 실시간 도착 정보
        const subway = await getRealTimeSubwayInfo(departure);
        console.log(`[실시간 데이터]:`, subway);

        // 소요시간 계산
        const travelTime = await calculateTravelTime(departure, departureLine, arrival, transfer);
        console.log(`[소요시간]: ${travelTime}초`);

        // 도착역 날씨 데이터
        const weather = await getWeather(arrival, new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
        console.log(`[날씨 데이터]:`, weather);

        // 결과 반환
        res.json({ subway, travelTime, weather });
    } catch (error) {
        console.error('[API 데이터 처리 중 오류]:', error.message);
        res.status(500).json({ error: '데이터 처리 중 오류가 발생했습니다.', details: error.message });
    }
});

module.exports = router;
