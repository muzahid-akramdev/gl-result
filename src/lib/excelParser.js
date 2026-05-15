import * as XLSX from 'xlsx'

// Parse the CLASS9 result sheet Excel file
// Main sheet columns: A=roll, B=name, C-W=marks
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        const students = []
        // Data starts at row index 6 (row 7 in Excel, 0-indexed = 6)
        for (let i = 6; i < data.length; i++) {
          const row = data[i]
          const roll = row[0]
          if (!roll || isNaN(Number(roll))) continue
          const name = String(row[1] || '').trim()
          if (!name) continue

          students.push({
            roll:              Number(roll),
            name,
            class:             'নবম',
            exam_year:         '2025',
            bangla1_naib:      Number(row[2])  || 0,
            bangla1_written:   Number(row[3])  || 0,
            bangla2_naib:      Number(row[4])  || 0,
            bangla2_written:   Number(row[5])  || 0,
            english1:          Number(row[6])  || 0,
            english2:          Number(row[7])  || 0,
            math_naib:         Number(row[8])  || 0,
            math_written:      Number(row[9])  || 0,
            physics_naib:      Number(row[10]) || 0,
            physics_written:   Number(row[11]) || 0,
            chemistry_naib:    Number(row[12]) || 0,
            chemistry_written: Number(row[13]) || 0,
            biology_naib:      Number(row[14]) || 0,
            biology_written:   Number(row[15]) || 0,
            higher_math_naib:  Number(row[16]) || 0,
            higher_math_written:Number(row[17])|| 0,
            bgst_naib:         Number(row[18]) || 0,
            bgst_written:      Number(row[19]) || 0,
            islam_naib:        Number(row[20]) || 0,
            islam_written:     Number(row[21]) || 0,
            ict:               Number(row[22]) || 0,
          })
        }
        resolve(students)
      } catch (err) {
        reject(new Error('Excel ফাইল পড়তে সমস্যা হয়েছে: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি'))
    reader.readAsArrayBuffer(file)
  })
}
