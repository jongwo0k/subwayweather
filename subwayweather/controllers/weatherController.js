const axios = require('axios');

// 날짜 계산
const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

// 시간 계산
const getBaseTime = () => {
    const hours = new Date().getHours();

    if (hours >= 2 && hours < 5) return '0200';
    if (hours >= 5 && hours < 8) return '0500';
    if (hours >= 8 && hours < 11) return '0800';
    if (hours >= 11 && hours < 14) return '1100';
    if (hours >= 14 && hours < 17) return '1400';
    if (hours >= 17 && hours < 20) return '1700';
    if (hours >= 20 && hours < 23) return '2000';
    return '2300';
};

// 날씨 데이터 가져오기
const getWeather = async () => {
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const weatherEndPoint = process.env.WEATHER_API_ENDPOINT;

    const baseDate = getFormattedDate();
    const baseTime = getBaseTime();
    const weatherUrl = `${weatherEndPoint}/getUltraSrtNcst?serviceKey=${weatherApiKey}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=60&ny=127`;

    try {
        const response = await axios.get(weatherUrl);
        const items = response.data.response?.body?.items?.item || [];

        const temperature = items.find(item => item.category === 'T1H')?.obsrValue || null;
        const isRaining = (items.find(item => item.category === 'PTY')?.obsrValue || 0) > 0;

        return { temperature, isRaining };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw new Error("Failed to fetch weather data");
    }
};

module.exports = { getWeather };