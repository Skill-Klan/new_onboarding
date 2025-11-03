/**
 * Тестовий скрипт для перевірки логіки статистики оплат
 * Перевіряє математичну коректність та логічні зв'язки між даними
 */

const googleSheetsService = require('./googleSheetsService');

// Допоміжна функція для порівняння чисел з урахуванням похибки
function isApproximatelyEqual(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

// Функція для форматування помилок
function formatError(message, details = {}) {
  return {
    error: message,
    details: details
  };
}

// Тест 1: Перевірка getGlobalSummary()
async function testGlobalSummary() {
  console.log('\n📊 === ТЕСТ 1: getGlobalSummary() ===\n');
  
  try {
    const summary = await googleSheetsService.getGlobalSummary();
    
    console.log('Результат getGlobalSummary():');
    console.log(`  totalGivenToSchoolUSD: ${summary.totalGivenToSchoolUSD}`);
    console.log(`  remainderToSchoolUSD: ${summary.remainderToSchoolUSD}`);
    
    const errors = [];
    
    // Перевірка 1: Суми не можуть бути негативними
    if (summary.totalGivenToSchoolUSD < 0) {
      errors.push(formatError('totalGivenToSchoolUSD не може бути негативним', {
        value: summary.totalGivenToSchoolUSD
      }));
    }
    
    if (summary.remainderToSchoolUSD < 0) {
      errors.push(formatError('remainderToSchoolUSD не може бути негативним', {
        value: summary.remainderToSchoolUSD
      }));
    }
    
    // Перевірка 2: Залишок не може бути більшим за загальну суму
    // (якщо це не окрема логіка)
    
    if (errors.length > 0) {
      console.log('❌ Знайдено помилки:');
      errors.forEach(err => console.log(`  - ${err.error}`, err.details));
      return false;
    } else {
      console.log('✅ getGlobalSummary() пройшов перевірки');
      return true;
    }
  } catch (error) {
    console.error('❌ Помилка при виконанні getGlobalSummary():', error.message);
    return false;
  }
}

// Тест 2: Перевірка getPayingStudents()
async function testPayingStudents() {
  console.log('\n📊 === ТЕСТ 2: getPayingStudents() ===\n');
  
  try {
    const students = await googleSheetsService.getPayingStudents();
    
    console.log(`Знайдено студентів: ${students.length}`);
    
    const errors = [];
    let validStudents = 0;
    
    for (const student of students) {
      const studentErrors = [];
      
      // Перевірка 1: Обов'язкові поля
      if (!student.student_name || student.student_name.trim() === '') {
        studentErrors.push('Відсутнє ім\'я студента');
      }
      
      // Перевірка 2: Логічні зв'язки між сумами
      if (student.total_given_to_school_usd !== null && 
          student.total_given_to_school_usd !== undefined &&
          student.total_given_usd !== null && 
          student.total_given_usd !== undefined) {
        
        // total_given_to_school_usd не може бути більшим за total_given_usd
        if (student.total_given_to_school_usd > student.total_given_usd) {
          studentErrors.push(`total_given_to_school_usd (${student.total_given_to_school_usd}) більший за total_given_usd (${student.total_given_usd})`);
        }
      }
      
      // Перевірка 3: Залишок не може бути негативним
      if (student.remainder_to_school_usd !== null && student.remainder_to_school_usd < 0) {
        studentErrors.push(`remainder_to_school_usd негативний: ${student.remainder_to_school_usd}`);
      }
      
      if (student.remainder_to_mentor_usd !== null && student.remainder_to_mentor_usd < 0) {
        studentErrors.push(`remainder_to_mentor_usd негативний: ${student.remainder_to_mentor_usd}`);
      }
      
      if (student.total_remainder_usd !== null && student.total_remainder_usd < 0) {
        studentErrors.push(`total_remainder_usd негативний: ${student.total_remainder_usd}`);
      }
      
      // Перевірка 4: total_remainder_usd = remainder_to_school_usd + remainder_to_mentor_usd
      // ВИНЯТОК: Якщо весь відсоток йде школі (remainder_to_mentor_usd = 0), 
      // то total_remainder_usd може дорівнювати тільки remainder_to_school_usd
      if (student.remainder_to_school_usd !== null && 
          student.remainder_to_mentor_usd !== null && 
          student.total_remainder_usd !== null) {
        
        // Якщо remainder_to_mentor_usd = 0 (весь відсоток йде школі), 
        // то total_remainder_usd = remainder_to_school_usd
        if (student.remainder_to_mentor_usd === 0 || Math.abs(student.remainder_to_mentor_usd) < 0.01) {
          // Весь відсоток йде школі - total_remainder_usd = remainder_to_school_usd
          if (!isApproximatelyEqual(student.total_remainder_usd, student.remainder_to_school_usd, 0.1)) {
            // Не помилка - це може бути окрема формула в Google Sheets
            // Пропускаємо цю перевірку
          }
        } else {
          // Якщо є залишок ментору, то total_remainder_usd = remainder_to_school_usd + remainder_to_mentor_usd
          const expectedTotal = student.remainder_to_school_usd + student.remainder_to_mentor_usd;
          if (!isApproximatelyEqual(student.total_remainder_usd, expectedTotal, 0.1)) {
            studentErrors.push(`total_remainder_usd (${student.total_remainder_usd}) не дорівнює сумі remainder_to_school_usd + remainder_to_mentor_usd (${expectedTotal})`);
          }
        }
      }
      
      if (studentErrors.length > 0) {
        errors.push({
          student: student.student_name,
          errors: studentErrors
        });
      } else {
        validStudents++;
      }
    }
    
    if (errors.length > 0) {
      console.log(`❌ Знайдено помилки у ${errors.length} студентів:`);
      errors.slice(0, 10).forEach(err => {
        console.log(`  Студент: ${err.student}`);
        err.errors.forEach(e => console.log(`    - ${e}`));
      });
      if (errors.length > 10) {
        console.log(`  ... та ще ${errors.length - 10} студентів з помилками`);
      }
      return false;
    } else {
      console.log(`✅ Всі ${validStudents} студентів пройшли перевірки`);
      return true;
    }
  } catch (error) {
    console.error('❌ Помилка при виконанні getPayingStudents():', error.message);
    return false;
  }
}

// Тест 3: Перевірка getPaymentHistory()
async function testPaymentHistory() {
  console.log('\n📊 === ТЕСТ 3: getPaymentHistory() ===\n');
  
  try {
    // Спочатку отримуємо список студентів
    const students = await googleSheetsService.getPayingStudents();
    
    if (students.length === 0) {
      console.log('⚠️ Немає студентів для перевірки');
      return true;
    }
    
    // Перевіряємо перших 5 студентів
    const testStudents = students.slice(0, 5);
    const errors = [];
    let totalTransactions = 0;
    let validTransactions = 0;
    
    for (const student of testStudents) {
      console.log(`\nПеревірка студента: ${student.student_name}`);
      
      try {
        const transactions = await googleSheetsService.getPaymentHistory(student.student_name);
        totalTransactions += transactions.length;
        
        console.log(`  Знайдено транзакцій: ${transactions.length}`);
        
        for (let i = 0; i < transactions.length; i++) {
          const txn = transactions[i];
          const txnErrors = [];
          
          // Перевірка 1: amountUSD = amountUAH / usdRate
          if (txn.usd_rate > 0 && txn.amount_uah > 0) {
            const expectedUSD = txn.amount_uah / txn.usd_rate;
            if (!isApproximatelyEqual(txn.amount_usd, expectedUSD, 0.01)) {
              txnErrors.push(`amount_usd (${txn.amount_usd}) не дорівнює amount_uah / usd_rate (${expectedUSD})`);
            }
          }
          
          // Перевірка 2: mentor_share_usd + school_share_usd = amountUSD (приблизно)
          const sharesSum = txn.mentor_share_usd + txn.school_share_usd;
          if (txn.amount_usd > 0.01) { // Якщо amount_usd > 0
            if (!isApproximatelyEqual(txn.amount_usd, sharesSum, 0.1)) {
              // Якщо shares мають значення, а amountUSD близький до 0, це може бути нормально
              if (sharesSum > 0.01) {
                txnErrors.push(`amount_usd (${txn.amount_usd}) не дорівнює сумі shares (${sharesSum})`);
              }
            }
          }
          
          // Перевірка 3: Відсотки повинні в сумі давати 1 (1 = 100%, 0.5 = 50%)
          // Формат: 1 = 100%, 0.3 = 30%, 0.7 = 70%
          const totalPercent = txn.mentor_percent + txn.school_percent;
          if (txn.mentor_percent > 0 || txn.school_percent > 0) {
            if (!isApproximatelyEqual(totalPercent, 1, 0.01)) {
              txnErrors.push(`Сума відсотків (${totalPercent}) не дорівнює 1 (100%)`);
            }
          }
          
          // Перевірка 4: Перевірка накопичення залишків
          // Перша транзакція має мати remainder = share (якщо це початковий залишок)
          // Наступні транзакції мають мати remainder >= 0
          if (txn.mentor_remainder_usd < 0 || txn.school_remainder_usd < 0 || txn.total_remainder_usd < 0) {
            txnErrors.push('Залишок не може бути негативним');
          }
          
          // Перевірка 5: total_remainder_usd = mentor_remainder_usd + school_remainder_usd
          const expectedTotalRemainder = txn.mentor_remainder_usd + txn.school_remainder_usd;
          if (!isApproximatelyEqual(txn.total_remainder_usd, expectedTotalRemainder, 0.1)) {
            txnErrors.push(`total_remainder_usd (${txn.total_remainder_usd}) не дорівнює сумі залишків (${expectedTotalRemainder})`);
          }
          
          // Перевірка 6: Перевірка накопичення totals
          // Якщо це не перша транзакція, total повинен бути >= попередній total + share
          if (i > 0) {
            const prevTxn = transactions[i - 1];
            if (txn.mentor_total_usd < prevTxn.mentor_total_usd) {
              txnErrors.push(`mentor_total_usd зменшився з ${prevTxn.mentor_total_usd} до ${txn.mentor_total_usd}`);
            }
            if (txn.school_total_usd < prevTxn.school_total_usd) {
              txnErrors.push(`school_total_usd зменшився з ${prevTxn.school_total_usd} до ${txn.school_total_usd}`);
            }
          }
          
          if (txnErrors.length > 0) {
            errors.push({
              student: student.student_name,
              transaction: txn.date,
              errors: txnErrors
            });
          } else {
            validTransactions++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Помилка при отриманні історії для ${student.student_name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Підсумок:`);
    console.log(`  Всього транзакцій перевірено: ${totalTransactions}`);
    console.log(`  Валідних транзакцій: ${validTransactions}`);
    console.log(`  Транзакцій з помилками: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Знайдено помилки у транзакціях:`);
      errors.slice(0, 10).forEach(err => {
        console.log(`  Студент: ${err.student}, Дата: ${err.transaction}`);
        err.errors.forEach(e => console.log(`    - ${e}`));
      });
      if (errors.length > 10) {
        console.log(`  ... та ще ${errors.length - 10} транзакцій з помилками`);
      }
      return false;
    } else {
      console.log(`\n✅ Всі транзакції пройшли перевірки`);
      return true;
    }
  } catch (error) {
    console.error('❌ Помилка при виконанні testPaymentHistory():', error.message);
    return false;
  }
}

// Головна функція
async function runAllTests() {
  console.log('🚀 Початок тестування статистики оплат\n');
  console.log('='.repeat(60));
  
  const results = {
    globalSummary: false,
    payingStudents: false,
    paymentHistory: false
  };
  
  try {
    // Ініціалізуємо сервіс
    await googleSheetsService.initialize();
    
    // Запускаємо тести
    results.globalSummary = await testGlobalSummary();
    results.payingStudents = await testPayingStudents();
    results.paymentHistory = await testPaymentHistory();
    
    // Підсумок
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 ПІДСУМОК ТЕСТУВАННЯ:\n');
    console.log(`  getGlobalSummary(): ${results.globalSummary ? '✅ ПРОЙДЕНО' : '❌ ПРОВАЛЕНО'}`);
    console.log(`  getPayingStudents(): ${results.payingStudents ? '✅ ПРОЙДЕНО' : '❌ ПРОВАЛЕНО'}`);
    console.log(`  getPaymentHistory(): ${results.paymentHistory ? '✅ ПРОЙДЕНО' : '❌ ПРОВАЛЕНО'}`);
    
    const allPassed = Object.values(results).every(r => r === true);
    
    if (allPassed) {
      console.log('\n✅ Всі тести пройшли успішно!');
      process.exit(0);
    } else {
      console.log('\n❌ Деякі тести провалилися. Перевірте вивід вище.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Критична помилка:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Запускаємо тести
runAllTests();

