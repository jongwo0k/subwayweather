const dataLines = require('../data/dataLines.json');
const dataTransfers = require('../data/dataTransfers.json');

// 경로 탐색
const findRoute = (departure, departureLine, arrival, transferStation) => {
    const route = [];
    let currentStation = departure;
    let currentLine = departureLine;

    // 직행
    if (dataLines[currentLine].some((s) => s.station === arrival)) {
        addStationsToRoute(route, currentLine, departure, arrival);
    }
    // 환승
    else if (transferStation && dataLines[currentLine].some((s) => s.station === transferStation)) {
        addStationsToRoute(route, currentLine, departure, transferStation);

        const newLine = switchLine(transferStation, currentLine);
        if (!dataLines[newLine].some((s) => s.station === arrival)) {
            throw new Error(`${arrival}은 환승 후 노선 ${newLine}에서도 찾을 수 없습니다.(현재 1회 환승 경로만 지원합니다)`);
        }

        addStationsToRoute(route, newLine, transferStation, arrival);
    } else {
        throw new Error('경로를 탐색할 수 없습니다.');
    }

    return route;
};

// 경로에 역 추가
const addStationsToRoute = (route, line, start, end) => {
    const stations = dataLines[line];
    const startIndex = stations.findIndex((s) => s.station === start);
    const endIndex = stations.findIndex((s) => s.station === end);

    if (startIndex < endIndex) {
        for (let i = startIndex; i <= endIndex; i++) {
            route.push({ line, station: stations[i].station });
        }
    } else {
        for (let i = startIndex; i >= endIndex; i--) {
            route.push({ line, station: stations[i].station });
        }
    }
};

// 노선 변경(환승)
const switchLine = (station, currentLine) => {
    const transferLines = dataTransfers[station];
    if (!transferLines || !transferLines.includes(String(currentLine))) {
        throw new Error(`${station}에서 환승 정보가 없습니다.`);
    }
    return transferLines.find((line) => line !== String(currentLine));
};

// 시간 단위 변환
const parseTime = (timeString) => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
};

// 역간 소요시간 계산 (Json)
const getTravelTime = (line, fromStation, toStation) => {
    const stations = dataLines[line];
    const fromIndex = stations.findIndex((s) => s.station === fromStation);
    const toIndex = stations.findIndex((s) => s.station === toStation);

    if (fromIndex === -1 || toIndex === -1) {
        throw new Error(`${fromStation} 또는 ${toStation}을(를) ${line}호선에서 찾을 수 없습니다.`);
    }

    let totalTime = 0;

    // 방향 적용
    if (fromIndex < toIndex) {
        for (let i = fromIndex; i < toIndex; i++) {
            totalTime += parseTime(stations[i + 1].HM);
        }
    } else {
        for (let i = fromIndex; i > toIndex; i--) {
            totalTime += parseTime(stations[i].HM);
        }
    }

    return totalTime;
};

// 총 소요시간 계산 
const calculateTravelTime = (departure, departureLine, arrival, transferStation = null) => {
    try {
        const route = findRoute(departure, departureLine, arrival, transferStation);
        console.log(`경로 탐색 결과:`, route);

        let totalTime = 0;

        // 각 구간 별 누적 합산
        for (let i = 0; i < route.length - 1; i++) {
            const { line: currentLine, station: fromStation } = route[i];
            const { station: toStation } = route[i + 1];

            const travelTime = getTravelTime(currentLine, fromStation, toStation);
            totalTime += travelTime;
        }

        console.log(`총 소요 시간: ${totalTime}초`);
        return totalTime;
    } catch (error) {
        console.error('소요 시간 계산 중 오류:', error.message);
        throw error;
    }
};

module.exports = { calculateTravelTime };