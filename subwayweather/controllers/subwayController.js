const axios = require('axios');

// 지하철 데이터 가져오기
const getSubwayData = async (station) => {
    const subwayApiKey = process.env.SUBWAY_API_KEY;
    const subwayUrl = `http://swopenAPI.seoul.go.kr/api/subway/${subwayApiKey}/json/realtimeStationArrival/0/5/${encodeURIComponent(station)}`;

    try {
        const response = await axios.get(subwayUrl);
        const subwayData = response.data.realtimeArrivalList || [];

        return subwayData.map(train => ({
            trainLine: train.trainLineNm,
            destination: train.bstatnNm,
            arrivalTime: train.arvlMsg2
        }));
    } catch (error) {
        console.error("Error fetching subway data:", error);
        throw new Error("Failed to fetch subway data");
    }
};

module.exports = { getSubwayData };