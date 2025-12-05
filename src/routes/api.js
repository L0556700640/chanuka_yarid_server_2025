const express = require('express');
const router = express.Router();
const RoomsController = require('../controllers/roomsController');
const UsersController = require('../controllers/usersController');

const roomsController = new RoomsController();
const usersController = new UsersController();

// Endpoint to get room information
router.get('/rooms', roomsController.getRooms.bind(roomsController));

// Endpoint to get user data
router.get('/users/:id', usersController.getUser.bind(usersController));

// Endpoint to charge user points
router.post('/users/:id/charge', usersController.chargePoints.bind(usersController));

// Endpoint to reduce user points
router.post('/users/:id/reduce', usersController.reducePoints.bind(usersController));

// Endpoint to add points to user
router.post('/users/:id/add', usersController.addPoints.bind(usersController));

module.exports = router;