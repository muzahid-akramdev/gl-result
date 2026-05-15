export const calcGrade = (marks, type) => {
  const m = Number(marks) || 0
  if (type === 1) { // 100m
    if (m>=80) return 'A+'; if (m>=70) return 'A'; if (m>=60) return 'A-'
    if (m>=50) return 'B';  if (m>=40) return 'C'; if (m>=33) return 'D'; return 'F'
  }
  if (type === 2) { // 50m
    if (m>=40) return 'A+'; if (m>=35) return 'A'; if (m>=30) return 'A-'
    if (m>=25) return 'B';  if (m>=20) return 'C'; if (m>=17) return 'D'; return 'F'
  }
  if (type === 3) { // 25m ICT
    if (m>=20) return 'A+'; if (m>=18) return 'A'; if (m>=15) return 'A-'
    if (m>=13) return 'B';  if (m>=10) return 'C'; if (m>=8)  return 'D'; return 'F'
  }
  if (type === 4) { // 75m Science 9-10
    if (m>=60) return 'A+'; if (m>=53) return 'A'; if (m>=45) return 'A-'
    if (m>=37) return 'B';  if (m>=30) return 'C'; if (m>=25) return 'D'; return 'F'
  }
  return 'F'
}

export const gradeToGPA = g => ({'A+':5,A:4,'A-':3.5,B:3,C:2,D:1,F:0}[g]??0)

export const cgpaGrade = c => {
  if (c>=5) return 'A+'; if (c>=4) return 'A'; if (c>=3.5) return 'A-'
  if (c>=3) return 'B';  if (c>=2) return 'C'; if (c>=1)   return 'D'; return 'F'
}

export const EXAM_TYPES = ['প্রথম সাময়িক পরীক্ষা', 'নির্বাচনি পরীক্ষা', 'বার্ষিক পরীক্ষা']

export const CLASS_GROUPS = {
  '6':  {label:'ষষ্ঠ',   group:'6-8'},
  '7':  {label:'সপ্তম',  group:'6-8'},
  '8':  {label:'অষ্টম',  group:'6-8'},
  '9':  {label:'নবম',    group:'9-10'},
  '10': {label:'দশম',    group:'9-10'},
}

// Class 6-8: 10 subjects
// Col map (0-indexed from Excel row): C=2,D=3 বাং১ | E=4,F=5 বাং২ | G=6 ইং১ | H=7 ইং২
// I=8,J=9 গণিত | K=10,L=11 বিজ্ঞান | M=12,N=13 বাওবি | O=14,P=15 ইসলাম
// Q=16,R=17 কৃষি | S=18 তথ্যপ্রযুক্তি
export const SUBJECTS_6_8 = [
  {key:'bangla1',  label:'বাংলা প্রথম পত্র',         naib:'bangla1_naib',   written:'bangla1_written',  type:1, max:100},
  {key:'bangla2',  label:'বাংলা দ্বিতীয় পত্র',        naib:'bangla2_naib',   written:'bangla2_written',  type:2, max:50},
  {key:'english1', label:'ইংরেজি প্রথম পত্র',          naib:null,             written:'english1',         type:1, max:100},
  {key:'english2', label:'ইংরেজি দ্বিতীয় পত্র',       naib:null,             written:'english2',         type:2, max:50},
  {key:'math',     label:'গণিত',                       naib:'math_naib',      written:'math_written',     type:1, max:100},
  {key:'science',  label:'বিজ্ঞান',                    naib:'science_naib',   written:'science_written',  type:1, max:100},
  {key:'bgst',     label:'বাওবি',                      naib:'bgst_naib',      written:'bgst_written',     type:1, max:100},
  {key:'islam',    label:'ইসলাম শিক্ষা',               naib:'islam_naib',     written:'islam_written',    type:1, max:100},
  {key:'krishi',   label:'কৃষি শিক্ষা',                naib:'krishi_naib',    written:'krishi_written',   type:1, max:100, isFourth:true},
  {key:'ict',      label:'তথ্য প্রযুক্তি',             naib:null,             written:'ict',              type:3, max:25},
]

// Class 9-10: 12 subjects
export const SUBJECTS_9_10 = [
  {key:'bangla1',     label:'বাংলা প্রথম পত্র',          naib:'bangla1_naib',      written:'bangla1_written',      type:1, max:100},
  {key:'bangla2',     label:'বাংলা দ্বিতীয় পত্র',         naib:'bangla2_naib',      written:'bangla2_written',      type:2, max:50},
  {key:'english1',    label:'ইংরেজি প্রথম পত্র',           naib:null,                written:'english1',             type:1, max:100},
  {key:'english2',    label:'ইংরেজি দ্বিতীয় পত্র',        naib:null,                written:'english2',             type:2, max:50},
  {key:'math',        label:'গণিত',                        naib:'math_naib',         written:'math_written',         type:1, max:100},
  {key:'physics',     label:'পদার্থবিজ্ঞান',               naib:'physics_naib',      written:'physics_written',      type:4, max:75},
  {key:'chemistry',   label:'রসায়ন',                       naib:'chemistry_naib',    written:'chemistry_written',    type:4, max:75},
  {key:'biology',     label:'জীববিজ্ঞান',                  naib:'biology_naib',      written:'biology_written',      type:4, max:75},
  {key:'higher_math', label:'উচ্চতর গণিত/কৃষিশিক্ষা',    naib:'higher_math_naib',  written:'higher_math_written',  type:4, max:75, isFourth:true},
  {key:'bgst910',     label:'বাংলাদেশ ও বিশ্বপরিচয়',     naib:'bgst_naib',         written:'bgst_written',         type:1, max:100},
  {key:'islam',       label:'ইসলাম শিক্ষা',                naib:'islam_naib',        written:'islam_written',        type:1, max:100},
  {key:'ict',         label:'তথ্য ও যোগাযোগ প্রযুক্তি',  naib:null,                written:'ict',                  type:3, max:25},
]

export const getSubjects = (classNum) =>
  CLASS_GROUPS[String(classNum)]?.group === '6-8' ? SUBJECTS_6_8 : SUBJECTS_9_10

export const calcResult = (student) => {
  const subjects = getSubjects(student.class_num || '9')
  const computed = subjects.map(s => {
    const naib    = s.naib ? (Number(student[s.naib])||0) : 0
    const written = Number(student[s.written])||0
    const total   = s.naib ? naib+written : written
    const grade   = calcGrade(total, s.type)
    const gpa     = gradeToGPA(grade)
    return {...s, naib, written, total, grade, gpa}
  })
  const anyFail    = computed.some(s => s.grade==='F')
  const totalMarks = computed.reduce((a,s)=>a+s.total,0)
  const sumGPA     = computed.reduce((a,s)=>a+s.gpa,0)
  const n          = computed.length
  let cgpa = 0
  if (!anyFail) {
    const fourth   = computed.find(s=>s.isFourth)
    const others   = computed.filter(s=>!s.isFourth)
    const minOther = Math.min(...others.map(s=>s.gpa))
    cgpa = Math.min(5,(sumGPA+Math.min(fourth?.gpa??0,minOther))/n)
    cgpa = Math.round(cgpa*100)/100
  }
  return {subjects:computed, totalMarks, anyFail, cgpa, cgpaGrade:cgpaGrade(cgpa), passed:!anyFail&&cgpa>=2}
}

export const GRADE_COLORS = {
  'A+': {text:'#15803d', bg:'#dcfce7', border:'#86efac'},
  'A':  {text:'#166534', bg:'#f0fdf4', border:'#bbf7d0'},
  'A-': {text:'#15803d', bg:'#f0fdf4', border:'#bbf7d0'},
  'B':  {text:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe'},
  'C':  {text:'#92400e', bg:'#fffbeb', border:'#fde68a'},
  'D':  {text:'#9a3412', bg:'#fff7ed', border:'#fed7aa'},
  'F':  {text:'#991b1b', bg:'#fef2f2', border:'#fecaca'},
}
