const express = require("express");
const router = express.Router();
const SheetsService = require("../services/sheetsService");
const sheets = new SheetsService();

// GET user by chip — פתוח לציבור (אין צורך בסיסמה)
router.get("/users/:chip", async (req, res) => {
  try {
    const chip = req.params.chip;
    const user = await sheets.getUserByChip(chip);
    if (!user) return res.status(404).json({ error: "User not found" });

    const payload = {
      chipNum: String(user["chip"] || user["chipNum"] || user["id"] || chip),
      name: user["name"] || user["student"] || user["שם תלמיד"] || "",
      grade: user["grade"] || user["class"] || user["כיתה"] || "",
      remainingBalance: parseFloat(
        user["remainingBalance"] ||
          user["balance"] ||
          user["סך כסף שנטען"] - user["סך כסף שנוצל"] ||
          0
      ),
      remainingPoints: parseFloat(
        user["points"] ||
          user["סך נקודות שנצברו"] - user["סך נקודות שנוצלו"] ||
          0
      ),
    };

    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/api/highscores", async (req, res) => {
  try {
    const response = await axios.get(`${SCRIPT_URL}?action=getHighScore`);
    // נניח שהשורה הראשונה היא כותרות
    const rows = response.data;
    const scores = rows.slice(1).map((row) => ({
      roomNum: row[0],
      topScore: row[1],
      chipNum: row[2],
    }));
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch high scores" });
  }
});

// POST charge (add money) — מקבל password ונשלח ל-Apps Script
router.post("/users/:chip/charge", async (req, res) => {
  try {
    const chip = req.params.chip;
    const amount = parseFloat(req.body.amount);
    const password = req.body.password;
    console.log(chip, amount, password);

    if (isNaN(amount)) return res.status(400).json({ error: "Invalid amount" });
    if (!password) return res.status(400).json({ error: "Password required" });

    await sheets.updateUserCharge(chip, amount, password);

    const user = await sheets.getUserByChip(chip);
    const remaining = parseFloat(
      user["סך כסף שנטען"] - user["סך כסף שנוצל"] ||
        user["balance"] ||
        user["יתרה"] ||
        0
    );
    return res.json({
      success: true,
      message: `תוקף בהצלחה - יתרתך היא ${remaining}`,
      remainingBalance: remaining,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to charge" });
  }
});

// POST reduce (deduct money) — מקבל password ונשלח ל-Apps Script
router.post("/users/:chip/reduce", async (req, res) => {
  try {
    const chip = req.params.chip;
    const amount = parseFloat(req.body.amount);
    const room = req.body.room || "";
    const password = req.body.password;
    console.log(chip, amount, room, password);
    if (isNaN(amount)) return res.status(400).json({ error: "Invalid amount" });
    if (!password) return res.status(400).json({ error: "Password required" });

    // קבל את התגובה המלאה מה-Apps Script (כבר מפוענחת ל-JSON)
    const result = await sheets.reduceUserBalance(chip, amount, password, room);
    console.log("Reduce response:", result);

    // החזר את האובייקט המלא שחוזר מה-sheet (success, message, וכו')
    return res.json(result);

    // הסר את הקוד הישן שמנסה לפרסר שוב
    // res = JSON.parse(res.body);
    // return {
    //   success: res.success,
    //   message: res.message,
    // };
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to reduce balance" });
  }
});

// POST points (add/remove) — מקבל password ונשלח ל-Apps Script
router.post("/users/:chip/points", async (req, res) => {
  try {
    const chip = req.params.chip;
    const points = parseFloat(req.body.points);
    const room = req.body.room || "";
    const action = req.body.action || "add";
    const password = req.body.password;
    if (isNaN(points)) return res.status(400).json({ error: "Invalid points" });
    if (!password) return res.status(400).json({ error: "Password required" });
    let result;
    if (action === "add")
      result = await sheets.addUserPoints(chip, points, password, room);
    else if (action === "reduce") {
      result = await sheets.reduceUserPoints(chip, points, password, room);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    console.log("Points update response:", result);
    const user = await sheets.getUserByChip(chip);
    console.log(user);
    const remainingPoints = parseFloat(
      user["סך נקודות שנצברו"] || user["points"] || user["נקודות"] || 0
    );
    // console.log("Reduce response:", result);

    // החזר את האובייקט המלא שחוזר מה-sheet (success, message, וכו')
    return res.json({
      success: result.success,
      message:
        result.message ||
        `תוקף בהצלחה - נקודות נוכחיות ${remainingPoints} נקודות שנוצלו ${
          user["סך נקודות שנוצלו"] || 0
        }`,
      remainingPoints,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to update points" });
  }
});

module.exports = router;
