const axios = require("axios");

class SheetsService {
  constructor() {
    this.spreadsheetId =
      process.env.SPREADSHEET_ID ||
      process.env.SHEET_ID ||
      "1GO14iZ7Qck16S_hf_JRNfQLsIimJCA3lA2ZxDu3O9x0";
    this.usersSheet = process.env.USERS_SHEET_NAME || "users";
    this.roomsSheet = process.env.ROOMS_SHEET_NAME || "rooms";
    this.scriptUrl =
      process.env.APPS_SCRIPT_URL ||
      process.env.GOOGLE_APPS_SCRIPT_URL ||
      "https://script.google.com/macros/s/AKfycbwRq8afGGhfJtRjr_m9B9LTAqpEL7-XsWLXR2Nkty74inJEDXRRl93vFCrbQc9DmwBW/exec";
    if (!this.scriptUrl)
      console.warn("APPS_SCRIPT_URL not set - callScript will fail.");
  }

  async callScript(action, method = "GET", body = null) {
    if (!this.scriptUrl) throw new Error("APPS_SCRIPT_URL not configured");
    try {
      const config = {
        method,
        url: this.scriptUrl,
        params: { action },
        headers: { "Content-Type": "application/json" },
      };
      if (body && method.toUpperCase() === "POST") config.data = body;
      const res = await axios(config);
      return res.data;
    } catch (err) {
      const msg =
        err.response && err.response.data
          ? JSON.stringify(err.response.data)
          : err.message;
      throw new Error(`Apps Script call failed: ${msg}`);
    }
  }

  // Read all users via Apps Script and map headers -> objects
  async getAllUsersRaw() {
    const data = await this.callScript("getUsers", "GET");
    if (!Array.isArray(data) || data.length === 0) return [];
    const headers = data[0].map((h) => String(h).trim());
    return data.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i] !== undefined ? row[i] : ""));
      return obj;
    });
  }

  async getUserByChip(chipNum) {
    const users = await this.getAllUsersRaw();
    if (!users || users.length === 0) return null;
    const chipStr = String(chipNum);
    const found = users.find((u) => {
      // try several common header names
      const candidates = [
        "chip",
        "chipNum",
        "id",
        "מספר ציפ",
        "ציפ",
        "chip_id",
      ];
      for (const c of candidates) {
        if (u[c] !== undefined && String(u[c]) === chipStr) return true;
      }
      // fallback: check first column value if headers unknown
      const firstKey = Object.keys(u)[0];
      return firstKey && String(u[firstKey]) === chipStr;
    });
    return found || null;
  }

  async getAllRooms() {
    const data = await this.callScript("getRooms", "GET");
    if (!Array.isArray(data) || data.length === 0) return [];
    const headers = data[0].map((h) => String(h).trim());
    return data.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i] !== undefined ? row[i] : ""));
      return obj;
    });
  }

  // Writes - forward password & params to Apps Script
  async updateUserCharge(chipNum, amount, password) {
    if (!password) throw new Error("Password required for charge");
    return await this.callScript("updateUserCharge", "POST", {
      chipNum,
      amount,
      password,
    });
  }

  async reduceUserBalance(chipNum, amount, password, room = "") {
    if (!password) throw new Error("Password required for reduce");
    return await this.callScript("reduceBalance", "POST", {
      chipNum,
      amount,
      password,
      roomNum: room,
    });
  }
  async reduceUserPoints(chipNum, points, password, room = "") {
    return await this.callScript("reducePoints", "POST", {
      chipNum,
      amount: points,
      roomNum: room,
      password,
    });
  }
  async addUserPoints(chipNum, points, password, room = "") {
    if (!password) throw new Error("Password required for addPoints");
    return await this.callScript("addPoints", "POST", {
      chipNum,
      amount: points,
      roomNum: room,
      password,
    });
  }
}

module.exports = SheetsService;
