import re

with open('server.js', 'r') as f:
    content = f.read()

# Замінюємо studentsResult
old1 = '    const studentsResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != \"\"))");'
new1 = '''    // Отримуємо кількість студентів з таблиці users
    let studentsQuery = "SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != ''))";
    const studentsParams = [];
    if (req.mentorFilter) {
      studentsQuery += ' AND mentor_name = $' + (studentsParams.length + 1);
      studentsParams.push(req.mentorFilter.mentorName);
    }
    const studentsResult = await pool.query(studentsQuery, studentsParams.length > 0 ? studentsParams : undefined);'''

content = content.replace(old1, new1)

# Замінюємо employedResult  
old2 = '    const employedResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != \"\")) AND LOWER(TRIM(current_step)) = \"офер\"");'
new2 = '''    // Студенти з тегом офер (працевлаштовані)
    let employedQuery = "SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != '')) AND LOWER(TRIM(current_step)) = 'офер'";
    const employedParams = [];
    if (req.mentorFilter) {
      employedQuery += ' AND mentor_name = $' + (employedParams.length + 1);
      employedParams.push(req.mentorFilter.mentorName);
    }
    const employedResult = await pool.query(employedQuery, employedParams.length > 0 ? employedParams : undefined);'''

content = content.replace(old2, new2)

# Замінюємо contracts блок
old3 = '''    // Виплачені кошти (з таблиці contracts, якщо вона існує)
    let paidAmount = 0;
    try {
      const contractsResult = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM contracts WHERE status IN ('paid', 'completed')");
      paidAmount = parseFloat(contractsResult.rows[0]?.total || 0);
    } catch (e) {
      // Таблиця contracts може не існувати, це нормально
      paidAmount = 0;
    }'''

new3 = '''    // Виплачені кошти (з таблиці contracts, якщо вона існує)
    let paidAmount = 0;
    try {
      let contractsQuery = "SELECT COALESCE(SUM(amount), 0) as total FROM contracts WHERE status IN ('paid', 'completed')";
      const contractsParams = [];
      if (req.mentorFilter) {
        const mentorStudentsResult = await pool.query(
          'SELECT phone_number FROM users WHERE mentor_name = sshpass -p "SamsunG" ssh -o StrictHostKeyChecking=no roman@192.168.88.121 "cd /home/roman/new_onboarding/server && cat > update_dashboard_filters.py << 'PYEOF'
import re

with open('server.js', 'r') as f:
    content = f.read()

# Замінюємо studentsResult
old1 = '    const studentsResult = await pool.query(\"SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != \\\"\\\"))\");'
new1 = '''    // Отримуємо кількість студентів з таблиці users
    let studentsQuery = \"SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != ''))\";
    const studentsParams = [];
    if (req.mentorFilter) {
      studentsQuery += ' AND mentor_name = $' + (studentsParams.length + 1);
      studentsParams.push(req.mentorFilter.mentorName);
    }
    const studentsResult = await pool.query(studentsQuery, studentsParams.length > 0 ? studentsParams : undefined);'''

content = content.replace(old1, new1)

# Замінюємо employedResult  
old2 = '    const employedResult = await pool.query(\"SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != \\\"\\\")) AND LOWER(TRIM(current_step)) = \\\"офер\\\"\");'
new2 = '''    // Студенти з тегом офер (працевлаштовані)
    let employedQuery = \"SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != '')) AND LOWER(TRIM(current_step)) = 'офер'\";
    const employedParams = [];
    if (req.mentorFilter) {
      employedQuery += ' AND mentor_name = $' + (employedParams.length + 1);
      employedParams.push(req.mentorFilter.mentorName);
    }
    const employedResult = await pool.query(employedQuery, employedParams.length > 0 ? employedParams : undefined);'''

content = content.replace(old2, new2)

# Замінюємо contracts блок
old3 = '''    // Виплачені кошти (з таблиці contracts, якщо вона існує)
    let paidAmount = 0;
    try {
      const contractsResult = await pool.query(\"SELECT COALESCE(SUM(amount), 0) as total FROM contracts WHERE status IN ('paid', 'completed')\");
      paidAmount = parseFloat(contractsResult.rows[0]?.total || 0);
    } catch (e) {
      // Таблиця contracts може не існувати, це нормально
      paidAmount = 0;
    }'''

new3 = '''    // Виплачені кошти (з таблиці contracts, якщо вона існує)
    let paidAmount = 0;
    try {
      let contractsQuery = \"SELECT COALESCE(SUM(amount), 0) as total FROM contracts WHERE status IN ('paid', 'completed')\";
      const contractsParams = [];
      if (req.mentorFilter) {
        const mentorStudentsResult = await pool.query(
          'SELECT phone_number FROM users WHERE mentor_name = $1',
          [req.mentorFilter.mentorName]
        );
        const mentorStudentPhones = mentorStudentsResult.rows.map(row => row.phone_number).filter(phone => phone);
        if (mentorStudentPhones.length > 0) {
          contractsQuery += ' AND student_phone = ANY($' + (contractsParams.length + 1) + ')';
          contractsParams.push(mentorStudentPhones);
        } else {
          paidAmount = 0;
        }
      }
      if (!req.mentorFilter || (req.mentorFilter && contractsParams.length > 0)) {
        const contractsResult = await pool.query(contractsQuery, contractsParams.length > 0 ? contractsParams : undefined);
        paidAmount = parseFloat(contractsResult.rows[0]?.total || 0);
      }
    } catch (e) {
      paidAmount = 0;
    }'''

content = content.replace(old3, new3)

with open('server.js', 'w') as f:
    f.write(content)

print('OK')
