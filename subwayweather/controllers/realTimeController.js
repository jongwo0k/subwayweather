require('dotenv').config();
const axios = require('axios');

// 실시간 도착정보 (출발역)
const getRealTimeSubwayInfo = async (stationName) => {
    try {
        const subwayApiKey = process.env.SUBWAY_API_KEY;
        const url = `http://swopenAPI.seoul.go.kr/api/subway/${subwayApiKey}/json/realtimeStationArrival/0/5/${encodeURIComponent(
            stationName
        )}`;
        console.log('API 요청 URL:', url);

        const response = await axios.get(url);

        const data = response.data.realtimeArrivalList;
        if (!data || data.length === 0) {
            throw new Error(`실시간 도착 정보를 가져올 수 없습니다: ${stationName}`);
        }
        
        // 데이터 추출
        const subwayInfo = data.map((item) => ({
            direction: item.trainLineNm,
            arrivalTimeSeconds: item.barvlDt,
            firstArrivalMessage: item.arvlMsg2,
        }));

        return subwayInfo;
    } catch (error) {
        console.error('실시간 도착 정보를 가져오는데에 error 발생:', error.message);
        throw error;
    }
};

module.exports = { getRealTimeSubwayInfo };
