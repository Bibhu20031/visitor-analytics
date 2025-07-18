const express = require('express')

const router= express.Router();
const analyticsController = require('../controllers/analytics.controller.js');

router.post('/events', analyticsController.handleEvent);
router.get('/analytics/summary', analyticsController.getSummary);
router.get('/analytics/session', analyticsController.getSessions);

module.exports = router;