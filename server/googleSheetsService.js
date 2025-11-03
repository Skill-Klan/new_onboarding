const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1yHGwLrSDkZPOh7uQoKgD7wSf9Twao7gAtc2hA4EwhpI';
const SHEET_NAME = 'загальний';
const DRIVE_FOLDER_ID = '1pQvA4DOfxeuc06VhxvmeZRcX0FCmFww-';
const CREDENTIALS_PATH = path.join(__dirname, 'skillklan-app-9a0e1d9f149a.json');

class GoogleSheetsService {
  constructor() {
    this.authWrite = null;
    this.sheetsWrite = null;
    this.driveWrite = null;
    this.auth = null;
    this.sheets = null;
    this.drive = null;
  }

  async initialize() {
    try {
      const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.readonly'
        ],
      });
      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      this.drive = google.drive({ version: 'v3', auth: authClient });
      console.log('✅ Google Sheets Service ініціалізовано');
      return true;
    } catch (error) {
      console.error('❌ Помилка ініціалізації Google Sheets Service:', error.message);
      return false;
    }
  }

  async getGlobalSummary() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        ranges: [],
        includeGridData: true,
      });

      const sheetData = response.data.sheets?.[0];
      const gridData = sheetData?.data?.[0];
      const rowData = gridData?.rowData || [];
      if (!rowData.length) return { totalGivenToSchoolUSD: 0, remainderToSchoolUSD: 0 };

      const headerRowIndex = 1;
      const headers = (rowData[headerRowIndex]?.values || []).map(c => c?.formattedValue || c?.effectiveValue?.stringValue || '');

      const getIndex = (title) => {
        const needle = title.toLowerCase();
        for (let i = 0; i < headers.length; i++) {
          const h = (headers[i] || '').toLowerCase().trim();
          if (h === needle || h.includes(needle)) return i;
        }
        return -1;
      };

      const colSchoolUSD = getIndex('всього віддано школі в доларах');
      const colRemainderSchool = getIndex('залишок школі в доларах');

      let totalGivenToSchoolUSD = 0;
      let remainderToSchoolUSD = 0;

      const parseNumber = (cell) => {
        if (!cell) return 0;
        const val = cell.formattedValue || cell.effectiveValue?.stringValue || '';
        if (typeof val === 'number') return val;
        const n = parseFloat(String(val).replace(/[^0-9.,-]/g, '').replace(',', '.'));
        return isNaN(n) ? 0 : n;
      };

      for (let i = headerRowIndex + 1; i < rowData.length; i++) {
        const row = rowData[i]?.values || [];
        if (colSchoolUSD !== -1) totalGivenToSchoolUSD += parseNumber(row[colSchoolUSD]);
        if (colRemainderSchool !== -1) remainderToSchoolUSD += parseNumber(row[colRemainderSchool]);
      }

      return { totalGivenToSchoolUSD, remainderToSchoolUSD };
    } catch (error) {
      console.error('❌ Помилка агрегації Google Sheets:', error.message);
      return { totalGivenToSchoolUSD: 0, remainderToSchoolUSD: 0 };
    }
  }


  
  async initializeWrite() {
    try {
      const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
      this.authWrite = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive'
        ],
      });
      const authClient = await this.authWrite.getClient();
      this.sheetsWrite = google.sheets({ version: 'v4', auth: authClient });
      this.driveWrite = google.drive({ version: 'v3', auth: authClient });
      console.log('✅ Google Sheets Write Client ініціалізовано');
      return true;
    } catch (error) {
      console.error('❌ Помилка ініціалізації Write Client:', error.message);
      return false;
    }
  }

  async getPayingStudents() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }
      
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        ranges: [SHEET_NAME + '!A:Z'],
        includeGridData: true,
      });

      const sheetData = response.data.sheets[0];
      if (!sheetData?.data?.[0]) {
        return [];
      }

      const gridData = sheetData.data[0];
      const rowData = gridData.rowData || [];
      
      const headerRowIndex = 1;
      if (headerRowIndex >= rowData.length) {
        return [];
      }

      const headerCells = rowData[headerRowIndex].values;
      const headers = headerCells.map(cell => {
        return cell?.formattedValue || cell?.effectiveValue?.stringValue || '';
      });

      const getIndex = (title) => {
        const needle = title.toLowerCase();
        for (let i = 0; i < headers.length; i++) {
          const h = (headers[i] || '').toLowerCase().trim();
          if (h === needle || h.includes(needle)) return i;
        }
        return -1;
      };

      const colName = getIndex('ім');
      const colTotalGivenUSD = getIndex('всього віддано в доларах');
      const colTotalGivenToSchoolUSD = getIndex('всього віддано школі в доларах');
      const colRemainderSchool = getIndex('залишок школі в доларах');
      const colRemainderMentor = getIndex('залишок ментору в доларах');
      const colTotalRemainder = getIndex('загальний залишок до виплати в доларах');
      const colPaymentStatus = getIndex('статус виплат');

      const parseNumber = (cell) => {
        if (!cell) return null;
        const val = cell.formattedValue || cell.effectiveValue?.stringValue || cell.effectiveValue?.numberValue;
        if (typeof val === 'number') return val;
        const n = parseFloat(String(val).replace(/[^0-9.,-]/g, '').replace(',', '.'));
        return isNaN(n) ? null : n;
      };

      const students = [];

      for (let i = headerRowIndex + 1; i < rowData.length; i++) {
        const row = rowData[i]?.values || [];
        const studentName = row[colName]?.formattedValue || row[colName]?.effectiveValue?.stringValue || '';
        
        if (!studentName || studentName.trim() === '') continue;
        if (studentName.toLowerCase().includes("всього") || studentName.startsWith("$")) continue;

        const totalGivenUSD = parseNumber(row[colTotalGivenUSD]);
        const totalGivenToSchoolUSD = parseNumber(row[colTotalGivenToSchoolUSD]);
        const remainderToSchoolUSD = parseNumber(row[colRemainderSchool]);
        const remainderToMentorUSD = parseNumber(row[colRemainderMentor]);
        const totalRemainderUSD = parseNumber(row[colTotalRemainder]);
        const paymentStatus = row[colPaymentStatus]?.formattedValue || row[colPaymentStatus]?.effectiveValue?.stringValue || null;

        students.push({
          student_name: studentName.trim(),
          total_given_usd: totalGivenUSD,
          total_given_to_school_usd: totalGivenToSchoolUSD,
          remainder_to_school_usd: remainderToSchoolUSD,
          remainder_to_mentor_usd: remainderToMentorUSD,
          total_remainder_usd: totalRemainderUSD,
          payment_status: paymentStatus
        });
      }

      return students;
    } catch (error) {
      console.error('❌ Помилка отримання списку студентів що виплачують:', error.message);
      return [];
    }
  }
  
  async addPaymentRecord(studentName, paymentDate, amount, usdRate) {
    try {
      console.log(`📝 Початок додавання оплати для: ${studentName}`);

      if (!this.sheets) {
        await this.initialize();
      }

      if (!this.sheetsWrite) {
        await this.initializeWrite();
      }

      // 1. Знайти таблицю студента в Google Drive
      console.log(`🔍 Пошук таблиці для: ${studentName}`);
      
      const response = await this.drive.files.list({
        q: `'${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 1000
      });

      const files = response.data.files || [];
      console.log(`📁 Знайдено файлів в папці: ${files.length}`);

      // Пошук файлу з точним або case-insensitive ім'ям
      const matchingFile = files.find(file => 
        file.name.trim() === studentName.trim() || 
        file.name.trim().toLowerCase() === studentName.trim().toLowerCase()
      );

      if (!matchingFile) {
        console.error(`❌ Таблиця для студента "${studentName}" не знайдена`);
        throw new Error(`Студента ${studentName} не знайдено`);
      }

      const spreadsheetId = matchingFile.id;
      console.log(`✅ Знайдено таблицю: ${matchingFile.name} (ID: ${spreadsheetId})`);

      // 2. Отримати ID першого листа
      const sheetsResponse = await this.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      });

      const sheets = sheetsResponse.data.sheets || [];
      if (sheets.length === 0) {
        throw new Error('Таблиця не містить листів');
      }

      const sheetId = sheets[0].properties.sheetId;
      console.log(`📄 Використовуємо лист ID: ${sheetId}`);

      // 3. Знайти останній заповнений рядок
      const valuesResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'A:C',
      });

      const rows = valuesResponse.data.values || [];
      let lastFilledRowIndex = -1;
      
      // Шукаємо останній рядок з даними в колонках A, B, C
      for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        if (row && row.length >= 3 && row[0] && row[1] && row[2]) {
          // Перевіряємо що дата має формат dd.MM.yyyy
          const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
          if (datePattern.test(row[0].trim())) {
            lastFilledRowIndex = i;
            break;
          }
        }
      }

      if (lastFilledRowIndex === -1) {
        throw new Error('Таблиця студента порожня');
      }

      console.log(`📍 Останній заповнений рядок: ${lastFilledRowIndex + 1}`);

      // 4. Визначити наступний порожній рядок
      const nextEmptyRowIndex = lastFilledRowIndex + 1;

      // 5. Дублювати останній рядок з формулами
      const batchRequest = {
        requests: [
          {
            copyPaste: {
              source: {
                sheetId: sheetId,
                startRowIndex: lastFilledRowIndex,
                endRowIndex: lastFilledRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: 26 // A-Z
              },
              destination: {
                sheetId: sheetId,
                startRowIndex: nextEmptyRowIndex,
                endRowIndex: nextEmptyRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: 26
              },
              pasteType: 'PASTE_NORMAL',
              pasteOrientation: 'NORMAL'
            }
          }
        ]
      };

      await this.sheetsWrite.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: batchRequest
      });

      console.log(`✅ Рядок ${lastFilledRowIndex + 1} дубльовано в ${nextEmptyRowIndex + 1}`);

      // 6. Оновити значення в колонках A, B, C
      const updateData = [
        { range: `A${nextEmptyRowIndex + 1}`, values: [[paymentDate]] },
        { range: `B${nextEmptyRowIndex + 1}`, values: [[amount]] },
        { range: `C${nextEmptyRowIndex + 1}`, values: [[usdRate]] }
      ];

      const batchUpdateRequest = {
        valueInputOption: 'USER_ENTERED',
        data: updateData
      };

      await this.sheetsWrite.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: batchUpdateRequest
      });

      console.log(`✅ Значення оновлено в рядку ${nextEmptyRowIndex + 1}`);
      console.log('✅ Оплата успішно додана');
      return { success: true, row: nextEmptyRowIndex + 1 };
    } catch (error) {
      console.error('❌ Помилка додавання оплати:', error.message);
      throw error;
    }
  }



  async getStudentFinancialData(firstName, lastName) {


    try {


      if (!this.sheets) {


        await this.initialize();


      }
      


      const studentName = `${firstName} ${lastName}`.trim();


      if (!studentName) {


        return null;


      }
      


      const response = await this.sheets.spreadsheets.get({


        spreadsheetId: SPREADSHEET_ID,


        ranges: [SHEET_NAME + '!A:Z'],


        includeGridData: true,


      });



      const sheetData = response.data.sheets?.[0];


      if (!sheetData?.data?.[0]) {


        return null;


      }



      const gridData = sheetData.data[0];


      const rowData = gridData.rowData || [];
      


      if (rowData.length < 2) {


        return null;


      }



      // Знаходимо заголовки


      const headerRowIndex = 1;


      const headerCells = rowData[headerRowIndex]?.values || [];


      const headers = headerCells.map(cell => {


        return (cell?.formattedValue || cell?.effectiveValue?.stringValue || '').toLowerCase().trim();


      });



      // Знаходимо індекси колонок


      const getIndex = (searchTerms) => {


        for (let i = 0; i < headers.length; i++) {


          const h = headers[i];


          if (searchTerms.some(term => h.includes(term))) {


            return i;


          }


        }


        return -1;


      };



      const colName = getIndex(["ім'я", "name", "студент"]);


      const colTotalUAH = getIndex(["всього віддано в гривнях", "uah", "грн"]);


      const colTotalUSD = getIndex(["всього віддано в доларах", "usd"]);


      const colSchoolUAH = getIndex(["всього віддано школі в гривнях", "школа uah"]);


      const colSchoolUSD = getIndex(["всього віддано школі в доларах", "школа в доларах"]);


      const colRemainderSchool = getIndex(["залишок школі в доларах", "залишок школі"]);


      const colRemainderMentor = getIndex(["залишок ментору в доларах", "залишок ментору"]);


      const colTotalRemainder = getIndex(["загальний залишок до виплати в доларах", "загальний залишок"]);


      const colPaymentStatus = getIndex(["статус виплат", "статус", "status"]);



      if (colName === -1) {


        console.error("❌ Не знайдено колонку з ім'ям");


        return null;


      }



      // Знаходимо рядок студента


      let studentRowIndex = -1;


      for (let i = headerRowIndex + 1; i < rowData.length; i++) {


        const row = rowData[i]?.values || [];


        const cellName = (row[colName]?.formattedValue || row[colName]?.effectiveValue?.stringValue || '').trim();
        


        if (cellName.toLowerCase() === studentName.toLowerCase() || 


            cellName.toLowerCase().includes(studentName.toLowerCase()) ||


            studentName.toLowerCase().includes(cellName.toLowerCase())) {


          studentRowIndex = i;


          break;


        }


      }



      if (studentRowIndex === -1) {


        return null;


      }



      // Функція для парсингу числа


      const parseNumber = (cell) => {


        if (!cell) return null;


        const val = cell.formattedValue || cell.effectiveValue?.numberValue || cell.effectiveValue?.stringValue || '';


        if (typeof val === 'number') return val;


        const n = parseFloat(String(val).replace(/[^0-9.,-]/g, "").replace(",", "."));


        return isNaN(n) ? null : n;


      };



      const getStringValue = (cell) => {


        if (!cell) return null;


        return cell.formattedValue || cell.effectiveValue?.stringValue || null;


      };



      const row = rowData[studentRowIndex]?.values || [];



      // Агрегуємо дані з усіх рядків цього студента


      let totalGivenUAH = 0;


      let totalGivenUSD = 0;


      let totalGivenToSchoolUAH = 0;


      let totalGivenToSchoolUSD = 0;


      let remainderToSchoolUSD = 0;


      let remainderToMentorUSD = 0;


      let totalRemainderUSD = 0;


      let paymentStatus = null;



      // Сумуємо всі рядки для цього студента


      for (let i = studentRowIndex; i < rowData.length; i++) {


        const currentRow = rowData[i]?.values || [];


        const cellName = (currentRow[colName]?.formattedValue || currentRow[colName]?.effectiveValue?.stringValue || '').trim();
        


        if (cellName.toLowerCase() !== studentName.toLowerCase() && 


            !cellName.toLowerCase().includes(studentName.toLowerCase()) &&


            !studentName.toLowerCase().includes(cellName.toLowerCase())) {


          break; // Зупиняємося коли знайшли іншого студента


        }



        // Сумуємо значення


        if (colTotalUAH !== -1) {


          const val = parseNumber(currentRow[colTotalUAH]);


          if (val !== null) totalGivenUAH += val;


        }


        if (colTotalUSD !== -1) {


          const val = parseNumber(currentRow[colTotalUSD]);


          if (val !== null) totalGivenUSD += val;


        }


        if (colSchoolUAH !== -1) {


          const val = parseNumber(currentRow[colSchoolUAH]);


          if (val !== null) totalGivenToSchoolUAH += val;


        }


        if (colSchoolUSD !== -1) {


          const val = parseNumber(currentRow[colSchoolUSD]);


          if (val !== null) totalGivenToSchoolUSD += val;


        }


        if (colRemainderSchool !== -1) {


          const val = parseNumber(currentRow[colRemainderSchool]);


          if (val !== null) remainderToSchoolUSD = val; // Беремо останнє значення


        }


        if (colRemainderMentor !== -1) {


          const val = parseNumber(currentRow[colRemainderMentor]);


          if (val !== null) remainderToMentorUSD = val;


        }


        if (colTotalRemainder !== -1) {


          const val = parseNumber(currentRow[colTotalRemainder]);


          if (val !== null) totalRemainderUSD = val;


        }


        if (colPaymentStatus !== -1 && !paymentStatus) {


          const val = getStringValue(currentRow[colPaymentStatus]);


          if (val) paymentStatus = val;


        }


      }



      return {


        studentName: studentName,


        totalGivenUAH: totalGivenUAH || null,


        totalGivenUSD: totalGivenUSD || null,


        totalGivenToSchoolUAH: totalGivenToSchoolUAH || null,


        totalGivenToSchoolUSD: totalGivenToSchoolUSD || null,


        remainderToSchoolUSD: remainderToSchoolUSD || null,


        remainderToMentorUSD: remainderToMentorUSD || null,


        totalRemainderUSD: totalRemainderUSD || null,


        paymentStatus: paymentStatus || null


      };


    } catch (error) {


      console.error('❌ Помилка отримання фінансових даних студента:', error.message);


      return null;


    }


  }


  async getPaymentHistory(studentName) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      if (!this.drive) {
        await this.initialize();
      }

      // Знаходимо таблицю студента в двох директоріях
      const folderIds = [
        '1pQvA4DOfxeuc06VhxvmeZRcX0FCmFww-', // Перша директорія
        '1AE9vCS6H6oDd2u5EAJ1xmbdTdGdOuoD-'  // Друга директорія
      ];

      let spreadsheetId = null;
      
      for (const folderId of folderIds) {
        const response = await this.drive.files.list({
          q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
          fields: 'files(id, name)',
          pageSize: 1000
        });

        const files = response.data.files || [];
        const matchingFile = files.find(file => 
          file.name.trim() === studentName.trim() || 
          file.name.trim().toLowerCase() === studentName.trim().toLowerCase()
        );

        if (matchingFile) {
          spreadsheetId = matchingFile.id;
          break;
        }
      }

      if (!spreadsheetId) {
        return [];
      }

      // Отримуємо назву першого листа
      const sheetsResponse = await this.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      });

      const sheets = sheetsResponse.data.sheets || [];
      if (sheets.length === 0) {
        return [];
      }

      const sheetName = sheets[0].properties.title;

      // Отримуємо дані з таблиці
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        ranges: [`${sheetName}!A:S`],
        includeGridData: true,
      });

      const sheetData = response.data.sheets[0];
      if (!sheetData?.data?.[0]) {
        return [];
      }

      const gridData = sheetData.data[0];
      const rowData = gridData.rowData || [];
      
      // Знаходимо заголовки (припускаємо що заголовки в рядку 2)
      const headerRowIndex = 1; // Рядок 2 в таблиці (індекс 1)
      if (headerRowIndex >= rowData.length) {
        return [];
      }

      const headerCells = rowData[headerRowIndex].values;
      const headers = headerCells.map(cell => {
        return (cell?.formattedValue || cell?.effectiveValue?.stringValue || '').toLowerCase().trim();
      });

      // Знаходимо індекси колонок
      const getIndex = (searchTerms) => {
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          if (searchTerms.some(term => h.includes(term))) {
            return i;
          }
        }
        return -1;
      };

      const colDate = 0; // Дата в першій колонці (колонка A)
      const colAmountUAH = getIndex(['сума внеску', 'гривнях']);
      const colUSDRate = getIndex(['курс долара', 'usd', 'долар']);
      
      // Ментор
      const colMentorPercent = getIndex(['% ментору']);
      const colMentorShareUSD = colMentorPercent !== -1 ? colMentorPercent + 1 : getIndex(['частка поточної виплати в доларах', 'частка ментору в доларах']);
      const colMentorShareUAH = colMentorPercent !== -1 ? colMentorPercent + 2 : getIndex(['частка з поточної виплати в гривнях']);
      const colMentorTotalUSD = getIndex(['всього в доларах']);
      const colMentorTotalUAH = getIndex(['всього віддано в гривнях']);
      const colMentorRemainder = getIndex(['залишок виплат в доларах']);
      
      // Школа
      const colSchoolPercent = getIndex(['% школі']);
      const colSchoolShareUSD = colSchoolPercent !== -1 ? colSchoolPercent + 1 : getIndex(['частка з поточної виплати в доларах']);
      const colSchoolShareUAH = colSchoolPercent !== -1 ? colSchoolPercent + 2 : getIndex(['частка з поточної виплати в гривнях']);
      const colSchoolTotalUSD = getIndex(['всього віддано в доларах']);
      const colSchoolTotalUAH = getIndex(['всього віддано в гривнях']);
      const colSchoolRemainder = getIndex(['залишок виплат школі']);
      
      // Загальні
      const colTotalUAH = getIndex(['всього віддано в гривнях (₴)']);
      const colTotalUSD = getIndex(['всього віддано в доларах ($)']);
      const colTotalRemainder = getIndex(['загальний залишок до виплати в доларах']);

      const parseNumber = (cell) => {
        if (!cell) return null;
        const val = cell.formattedValue || cell.effectiveValue?.numberValue || cell.effectiveValue?.stringValue || '';
        if (typeof val === 'number') return val;
        const n = parseFloat(String(val).replace(/[^0-9.,-]/g, '').replace(',', '.'));
        return isNaN(n) ? null : n;
      };

      const transactions = [];

      // Читаємо всі рядки даних (починаючи з рядка після заголовків)
      for (let i = headerRowIndex + 1; i < rowData.length; i++) {
        const row = rowData[i]?.values || [];
        
        // Пропускаємо порожні рядки
        if (row.length === 0) continue;
        
        const date = row[colDate]?.formattedValue || row[colDate]?.effectiveValue?.stringValue || '';
        
        // Якщо немає дати - пропускаємо рядок
        if (!date || date.trim() === '') continue;
        
        // Парсимо всі поля
        const amountUAH = parseNumber(row[colAmountUAH]) || 0;
        const usdRate = parseNumber(row[colUSDRate]) || 0;
        const amountUSD = usdRate > 0 ? amountUAH / usdRate : 0;
        
        // Генеруємо унікальний ID на основі індексу рядка та дати
        const uniqueId = `row-${i}-${date.trim()}`;
        
        transactions.push({
          id: uniqueId,
          date: date.trim(),
          amount_uah: amountUAH,
          usd_rate: usdRate,
          amount_usd: amountUSD,
          mentor_percent: parseNumber(row[colMentorPercent]) || 0,
          mentor_share_usd: parseNumber(row[colMentorShareUSD]) || 0,
          mentor_share_uah: parseNumber(row[colMentorShareUAH]) || 0,
          mentor_total_usd: parseNumber(row[colMentorTotalUSD]) || 0,
          mentor_total_uah: parseNumber(row[colMentorTotalUAH]) || 0,
          mentor_remainder_usd: parseNumber(row[colMentorRemainder]) || 0,
          school_percent: parseNumber(row[colSchoolPercent]) || 0,
          school_share_usd: parseNumber(row[colSchoolShareUSD]) || 0,
          school_share_uah: parseNumber(row[colSchoolShareUAH]) || 0,
          school_total_usd: parseNumber(row[colSchoolTotalUSD]) || 0,
          school_total_uah: parseNumber(row[colSchoolTotalUAH]) || 0,
          school_remainder_usd: parseNumber(row[colSchoolRemainder]) || 0,
          total_uah: parseNumber(row[colTotalUAH]) || 0,
          total_usd: parseNumber(row[colTotalUSD]) || 0,
          total_remainder_usd: parseNumber(row[colTotalRemainder]) || 0
        });
      }

      return transactions;
    } catch (error) {
      console.error('Помилка завантаження історії оплат:', error.message);
      return [];
    }
  }

  async getDeferredPayments() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const deferredSheetName = 'Відкладені платежі';
      
      // Перевіряємо, чи існує лист
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const sheetExists = spreadsheet.data.sheets?.some(
        sheet => sheet.properties?.title === deferredSheetName
      );

      if (!sheetExists) {
        // Якщо листа немає - повертаємо порожній масив
        return [];
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${deferredSheetName}!A1:G1000`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) {
        return [];
      }

      const headers = rows[0];
      const getIndex = (titles) => {
        const titlesLower = titles.map(t => t.toLowerCase());
        for (let i = 0; i < headers.length; i++) {
          const h = (headers[i] || '').toLowerCase().trim();
          if (titlesLower.some(t => h.includes(t))) return i;
        }
        return -1;
      };

      const colStudentName = getIndex(['студент', 'ім\'я', 'student']);
      const colFromMonth = getIndex(['з місяця', 'from_month', 'від місяця']);
      const colFromYear = getIndex(['з року', 'from_year', 'від року']);
      const colToMonth = getIndex(['на місяць', 'to_month', 'до місяця']);
      const colToYear = getIndex(['на рік', 'to_year', 'до року']);

      const monthNames = ['', 'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
                         'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

      const deferredPayments = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const studentName = (row[colStudentName] || '').trim();
        if (!studentName) continue;

        const fromMonth = parseInt(row[colFromMonth]) || 0;
        const fromYear = parseInt(row[colFromYear]) || 0;
        const toMonth = parseInt(row[colToMonth]) || 0;
        const toYear = parseInt(row[colToYear]) || 0;

        if (fromMonth > 0 && fromYear > 0 && toMonth > 0 && toYear > 0) {
          deferredPayments.push({
            id: `${studentName}-${fromYear}-${fromMonth}`,
            student_name: studentName,
            deferred_from_month: fromMonth,
            deferred_from_year: fromYear,
            deferred_to_month: toMonth,
            deferred_to_year: toYear,
            deferred_to_month_name: monthNames[toMonth] || ''
          });
        }
      }

      return deferredPayments;
    } catch (error) {
      console.error('❌ Помилка отримання відкладених платежів:', error.message);
      return [];
    }
  }

  // Додає відкладений платіж
  async deferPayment(studentName, fromMonth, fromYear, toMonth, toYear) {
    try {
      if (!this.sheetsWrite) {
        await this.initializeWrite();
      }

      const deferredSheetName = 'Відкладені платежі';
      
      // Перевіряємо, чи існує лист
      const spreadsheet = await this.sheetsWrite.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      let sheetExists = spreadsheet.data.sheets?.some(
        sheet => sheet.properties?.title === deferredSheetName
      );

      if (!sheetExists) {
        // Створюємо новий лист
        await this.sheetsWrite.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: deferredSheetName,
                }
              }
            }]
          }
        });

        // Додаємо заголовки
        await this.sheetsWrite.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${deferredSheetName}!A1:E1`,
          valueInputOption: 'RAW',
          resource: {
            values: [['Студент', 'З місяця', 'З року', 'На місяць', 'На рік']]
          }
        });
      }

      const monthNames = ['', 'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
                         'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

      // Додаємо новий рядок
      await this.sheetsWrite.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${deferredSheetName}!A:E`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [[studentName, fromMonth, fromYear, toMonth, toYear]]
        }
      });

      return {
        success: true,
        message: `Студент ${studentName} перенесений на ${monthNames[toMonth]} ${toYear}`
      };
    } catch (error) {
      console.error('❌ Помилка перенесення платежу:', error.message);
      throw error;
    }
}


  // Отримує відкладені платежі
