const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { getSubwayData } = require('../controllers/subwayController');

// API통합 데이터
router.get('/:station', async (req, res) => {
    const station = req.params.station;

    try {
        const [weather, subway] = await Promise.all([
            getWeather(),
            getSubwayData(station)
        ]);

        res.json({
            weather,
            subway
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Failed to fetch data");
    }
});

module.exports = router;