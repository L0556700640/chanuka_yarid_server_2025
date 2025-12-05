const axios = require('axios');

class SheetsService {
  constructor() {
    this.scriptUrl = "https://script.google.com/macros/s/AKfycbwRq8afGGhfJtRjr_m9B9LTAqpEL7-XsWLXR2Nkty74inJEDXRRl93vFCrbQc9DmwBW/exec"; 
    
    if (!this.scriptUrl) {
      console.warn("Warning: GOOGLE_SCRIPT_URL is not set.");
    }
  }

  // פונקציית עזר לביצוע בקשות לסקריפט
  async callScript(action, method = 'GET', data = null) {
    if (!this.scriptUrl) throw new Error('GOOGLE_SCRIPT_URL is missing');

    try {
      const config = {
        method: method,
        url: this.scriptUrl,
        params: { action: action }, // הפעולה נשלחת כפרמטר ב-URL
        headers: { 'Content-Type': 'application/json' }
      };

      if (data && method === 'POST') {
        config.data = data;
        // axios שולח post רגיל, אבל Apps Script מצפה לעיתים לטיפול מיוחד.
        // הקונפיגורציה הזו אמורה לעבוד עם ה-doPost שהגדרנו.
      }

      // Apps Script מחזיר לפעמים 302 Redirect, axios עוקב אחריו אוטומטית בדרך כלל.
      const response = await axios(config);
      return response.data;

    } catch (err) {
      console.error(`Failed to execute ${action}:`, err.message);
      throw err;
    }
  }

  // --- קריאות (Reads) ---

  async getUserByChip(chipNum) {
    // מקבלים את כל המערך מהסקריפט (כולל כותרות)
    const rows = await this.callScript('getUsers');
    
    if (!rows || rows.length === 0) return null;
    
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    // חיפוש לוגי בצד ה-Client (או שאפשר להעביר את הלוגיקה ל-Apps Script)
    const userRow = dataRows.find(r => String(r[0]) === String(chipNum));
    
    if (!userRow) return null;
    
    const obj = {};
    headers.forEach((h, i) => obj[h] = userRow[i] || '');
    return obj;
  }

  async getAllRooms() {
    const rows = await this.callScript('getRooms');
    if (!rows || rows.length === 0) return [];
    
    const headers = rows[0];
    return rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || '');
      return obj;
    });
  }

  // --- כתיבות (Writes) - עכשיו זה אפשרי! ---

  async updateUserCharge(chipNum, newAmount) {
    // שולחים בקשת POST לסקריפט
    return await this.callScript('updateUserCharge', 'POST', {
      chipNum: chipNum,
      amount: newAmount
    });
  }

  // דוגמאות לפונקציות נוספות (צריך לממש את ה-Case המקביל ב-Apps Script)
  async reduceUserBalance(chipNum, reduction) {
     // תצטרך להוסיף 'reduceBalance' ב-doPost בתוך ה-Apps Script
    return await this.callScript('reduceBalance', 'POST', { chipNum, reduction });
  }

  async addUserPoints(chipNum, points) {
    return await this.callScript('addPoints', 'POST', { chipNum, points });
  }
}

module.exports = SheetsService;