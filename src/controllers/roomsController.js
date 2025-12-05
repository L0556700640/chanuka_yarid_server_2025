const SheetsService = require('../services/sheetsService');

class RoomsController {
  constructor() {
    this.sheetsService = new SheetsService();
  }

  async getRooms(req, res) {
    try {
      const rooms = await this.sheetsService.getAllRooms();
      
      const formattedRooms = rooms.map(room => ({
        roomNumber: room['מספר חדר'],
        chipNum: room['מספר ציפ'],
        pointsEarned: room['נקודות שנצברו בחדר']
      }));

      res.json(formattedRooms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RoomsController;