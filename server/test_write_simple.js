const {google} = require("googleapis");
const creds = require("./skillklan-app-9a0e1d9f149a.json");

(async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  
  const client = await auth.getClient();
  const sheets = google.sheets({version: "v4", auth: client});
  
  try {
    // Try to read first
    const readResp = await sheets.spreadsheets.get({
      spreadsheetId: "1yHGwLrSDkZPOh7uQoKgD7wSf9Twao7gAtc2hA4EwhpI",
      ranges: ["загальний!A1:B5"]
    });
    console.log("Read OK");
    
    // Try to write (just update one cell)
    const writeResp = await sheets.spreadsheets.values.update({
      spreadsheetId: "1yHGwLrSDkZPOh7uQoKgD7wSf9Twao7gAtc2hA4EwhpI",
      range: "загальний!Z1000",
      valueInputOption: "RAW",
      resource: {values: [["TEST"]]}
    });
    console.log("Write OK");
  } catch (e) {
    console.error("Error:", e.message);
    console.error("Code:", e.code);
  }
})();
