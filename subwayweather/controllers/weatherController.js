require('dotenv').config();
const axios = require('axios');
const dataXY = require('../data/dataXY.json');

// 날짜 및 시간 계산
const calculateDateTime = (arrivalTime) => {
    try {
        const now = new Date();

        // 유효성 검사
        if (!arrivalTime || !/^\d{1,2}:\d{2}$/.test(arrivalTime)) {
            throw new Error(`[오류]: 도착시간 값이 잘못되었습니다: ${arrivalTime}`);
        }

        const [hour, minute] = arrivalTime.split(':').map(Number);

        now.setHours(hour, minute, 0);

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        // 시간 업데이트 (3시간 기준)
        const baseTime = (() => {
            if (hours >= 2 && hours < 5) return '0200';
            if (hours >= 5 && hours < 8) return '0500';
            if (hours >= 8 && hours < 11) return '0800';
            if (hours >= 11 && hours < 14) return '1100';
            if (hours >= 14 && hours < 17) return '1400';
            if (hours >= 17 && hours < 20) return '1700';
            if (hours >= 20 && hours < 23) return '2000';
            return '2300';
        })();

        return { baseDate: `${year}${month}${day}`, baseTime };
    } catch (error) {
        console.error(`[시간 계산 오류]:`, error.message);
        throw error;
    }
};

// 도착 시간 기준 날씨 데이터 가져오기
const getWeather = async (stationName, arrivalTime) => {
    console.log(`[디버깅]: arrivalTime=${arrivalTime}`);

    const weatherApiKey = process.env.WEATHER_API_KEY;
    const weatherEndPoint = process.env.WEATHER_API_ENDPOINT;

    const station = dataXY.find((s) => s.station_name.trim().toLowerCase() === stationName.trim().toLowerCase());
    if (!station) {
        throw new Error(`입력된 역명(${stationName})이 존재하지 않습니다.`);
    }

    // 기상청 기준 좌표(nx,ny) 사용
    const { nx, ny } = station;
    const { baseDate, baseTime } = calculateDateTime(arrivalTime);

    const weatherUrl = `${weatherEndPoint}/getUltraSrtNcst?serviceKey=${weatherApiKey}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    try {
        console.log(`[날씨 API 요청 URL]: ${weatherUrl}`);
        const response = await axios.get(weatherUrl);

        if (!response.data || !response.data.response?.body?.items) {
            console.error("[날씨 API가 응답하지 않습니다.]", response.data);
            throw new Error("날씨 API 응답이 유효하지 않습니다.");
        }

        const items = response.data.response.body.items.item || [];
        // 온도, 날씨
        const temperature = items.find((item) => item.category === 'T1H')?.obsrValue || null;
        const isRaining = (items.find((item) => item.category === 'PTY')?.obsrValue || 0) > 0;

        return { temperature, isRaining };
    } catch (error) {
        console.error('[날씨 API 오류]:', error.message);
        throw new Error('날씨 데이터 처리 중 오류가 발생했습니다.');
    }
};


module.exports = { getWeather };
