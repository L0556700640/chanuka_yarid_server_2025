const SheetsService = require('../services/sheetsService');

class UsersController {
  constructor() {
    this.sheetsService = new SheetsService();
  }

  async getUser(req, res) {
    try {
      const chipNum = req.params.id;
      const user = await this.sheetsService.getUserByChip(chipNum);
      
      if (!user) {
        return res.status(404).json({ error: 'משתמש לא נמצא' });
      }

      res.json({
        chipNum: user['מספר ציפ'],
        idNumber: user['תז'],
        name: user['שם תלמיד'],
        grade: user['כיתה'],
        totalCharged: user['סך כסף שנטען'],
        remainingBalance: parseFloat(user['סך כסף שנטען']) - parseFloat(user['סך כסף שנוצל']),
        totalPointsEarned: user['סך נקודות שנצברו'],
        totalPointsUsed: user['סך נקודות שנוצלו']
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async chargePoints(req, res) {
    try {
      const chipNum = req.params.id;
      const { amount } = req.body;

      await this.sheetsService.updateUserCharge(chipNum, amount);
      res.json({ success: true, message: 'כסף נטען בהצלחה' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async reducePoints(req, res) {
    try {
      const chipNum = req.params.id;
      const { amount, room } = req.body;

      await this.sheetsService.reduceUserBalance(chipNum, amount, room);
      res.json({ success: true, message: 'כסף הורד בהצלחה' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addPoints(req, res) {
    try {
      const chipNum = req.params.id;
      const { points, room } = req.body;

      await this.sheetsService.addUserPoints(chipNum, points, room);
      res.json({ success: true, message: 'נקודות נוספו בהצלחה' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UsersController;