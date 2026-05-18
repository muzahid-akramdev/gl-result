export const calcGrade = (marks: number, type: number): string => {
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

export const gradeToGPA = (g: string): number => ({'A+':5,A:4,'A-':3.5,B:3,C:2,D:1,F:0}[g]??0)

export const cgpaGrade = (c: number): string => {
  if (c>=5) return 'A+'; if (c>=4) return 'A'; if (c>=3.5) return 'A-'
  if (c>=3) return 'B';  if (c>=2) return 'C'; if (c>=1)   return 'D'; return 'F'
}

export const EXAM_TYPES = ['প্রথম সাময়িক পরীক্ষা', 'নির্বাচনি পরীক্ষা', 'বার্ষিক পরীক্ষা']

export const CLASS_GROUPS: Record<string, {label: string; group: string}> = {
  'play':     { label: 'প্লে',       group: 'play-nursery' },
  'nursery':  { label: 'নার্সারি',   group: 'play-nursery' },
  '1':        { label: 'প্রথম',      group: '1st' },
  '2':        { label: 'দ্বিতীয়',   group: '2nd' },
  '3':        { label: 'তৃতীয়',     group: '3rd' },
  '4':        { label: 'চতুর্থ',     group: '4th' },
  '5':        { label: 'পঞ্চম',      group: '5th' },
  '6':        { label: 'ষষ্ঠ',       group: '6-8' },
  '7':        { label: 'সপ্তম',      group: '6-8' },
  '8':        { label: 'অষ্টম',      group: '6-8' },
  '9':        { label: 'নবম',        group: '9-10' },
  '10':       { label: 'দশম',        group: '9-10' },
}

// ── Play & Nursery ──
// বাংলা, গণিত, ইংরেজি, ধর্ম, ছবি অংকন, সাধারণ জ্ঞান (100/100/100/100/50/50)
export const SUBJECTS_PLAY = [
  { key:'bangla',   label:'বাংলা',         naib:null, written:'bangla1_written',  type:1, max:100 },
  { key:'math',     label:'গণিত',          naib:null, written:'math_written',     type:1, max:100 },
  { key:'english',  label:'ইংরেজি',        naib:null, written:'english1',         type:1, max:100 },
  { key:'islam',    label:'ধর্ম',          naib:null, written:'islam_written',    type:1, max:100 },
  { key:'drawing',  label:'ছবি অংকন',     naib:null, written:'bgst_written',     type:2, max:50  },
  { key:'gk',       label:'সাধারণ জ্ঞান', naib:null, written:'krishi_written',   type:2, max:50  },
]

// ── Class 1 ──
// বাংলা, ইংরেজি, গণিত, পরিবেশ, ধর্ম, সাধারণ জ্ঞান, ছবি অংকন (100/100/100/100/100/50/50)
export const SUBJECTS_1 = [
  { key:'bangla',    label:'বাংলা',              naib:null, written:'bangla1_written',  type:1, max:100 },
  { key:'english',   label:'ইংরেজি',             naib:null, written:'english1',         type:1, max:100 },
  { key:'math',      label:'গণিত',               naib:null, written:'math_written',     type:1, max:100 },
  { key:'poribesh',  label:'পরিবেশ পরিচিতি',    naib:null, written:'science_written',  type:1, max:100 },
  { key:'islam',     label:'ধর্ম',               naib:null, written:'islam_written',    type:1, max:100 },
  { key:'gk',        label:'সাধারণ জ্ঞান',       naib:null, written:'krishi_written',   type:2, max:50  },
  { key:'drawing',   label:'ছবি অংকন',          naib:null, written:'bgst_written',     type:2, max:50  },
]

// ── Class 2 ──
// বাং১, বাং২, ইং১, ইং২, গণিত, পরিবেশ, ধর্ম, কম্পিউটার, সাধারণ, ছবি
// 100 / 50  / 100/ 50 / 100  / 100   / 100 / 50        / 50     / 50
export const SUBJECTS_2 = [
  { key:'bangla1',   label:'বাংলা প্রথম পত্র',     naib:null, written:'bangla1_written',  type:1, max:100 },
  { key:'bangla2',   label:'বাংলা দ্বিতীয় পত্র',  naib:null, written:'bangla2_written',  type:2, max:50  },
  { key:'english1',  label:'ইংরেজি প্রথম পত্র',    naib:null, written:'english1',         type:1, max:100 },
  { key:'english2',  label:'ইংরেজি দ্বিতীয় পত্র', naib:null, written:'english2',         type:2, max:50  },
  { key:'math',      label:'গণিত',                  naib:null, written:'math_written',     type:1, max:100 },
  { key:'poribesh',  label:'পরিবেশ পরিচিতি',       naib:null, written:'science_written',  type:1, max:100 },
  { key:'islam',     label:'ধর্ম',                  naib:null, written:'islam_written',    type:1, max:100 },
  { key:'computer',  label:'কম্পিউটার',             naib:null, written:'ict',              type:2, max:50  },
  { key:'gk',        label:'সাধারণ জ্ঞান',          naib:null, written:'krishi_written',   type:2, max:50  },
  { key:'drawing',   label:'ছবি অংকন',             naib:null, written:'bgst_written',     type:2, max:50  },
]

// ── Class 3 ──
// বাং১, বাং২, ইং১, ইং২, গণিত, বিজ্ঞান, বাংলাদেশ ও বিশ্বপরিচয়, ধর্ম, কম্পিউটার, সাধারণ জ্ঞান, ছবি অংকন
// 100 / 100 / 100/ 100/ 100  / 100   / 100                     / 100 / 50        / 50           / 50
export const SUBJECTS_3 = [
  { key:'bangla1',   label:'বাংলা প্রথম পত্র',          naib:null, written:'bangla1_written',  type:1, max:100 },
  { key:'bangla2',   label:'বাংলা দ্বিতীয় পত্র',       naib:null, written:'bangla2_written',  type:2, max:50  },
  { key:'english1',  label:'ইংরেজি প্রথম পত্র',         naib:null, written:'english1',         type:1, max:100 },
  { key:'english2',  label:'ইংরেজি দ্বিতীয় পত্র',      naib:null, written:'english2',         type:2, max:50  },
  { key:'math',      label:'গণিত',                       naib:null, written:'math_written',     type:1, max:100 },
  { key:'science',   label:'বিজ্ঞান',                    naib:null, written:'science_written',  type:1, max:100 },
  { key:'bgst',      label:'বাংলাদেশ ও বিশ্বপরিচয়',   naib:null, written:'bgst_written',     type:1, max:100 },
  { key:'islam',     label:'ধর্ম',                       naib:null, written:'islam_written',    type:1, max:100 },
  { key:'computer',  label:'কম্পিউটার',                  naib:null, written:'ict',              type:2, max:50  },
  { key:'gk',        label:'সাধারণ জ্ঞান',               naib:null, written:'krishi_written',   type:2, max:50  },
  { key:'drawing',   label:'ছবি অংকন',                  naib:null, written:'physics_written',  type:2, max:50  },
]

// ── Class 4 ──
// বাং১, বাং২, ইং১, ইং২, গণিত, বিজ্ঞান, বাংলাদেশ ও বিশ্বপরিচয়, ধর্ম, কম্পিউটার, সাধারণ জ্ঞান, ছবি অংকন
// 100 / 50  / 100/ 50 / 100  / 100   / 100                     / 100 / 50        / 50           / 50
export const SUBJECTS_4 = [
  { key:'bangla1',   label:'বাংলা প্রথম পত্র',          naib:null, written:'bangla1_written',  type:1, max:100 },
  { key:'bangla2',   label:'বাংলা দ্বিতীয় পত্র',       naib:null, written:'bangla2_written',  type:2, max:50  },
  { key:'english1',  label:'ইংরেজি প্রথম পত্র',         naib:null, written:'english1',         type:1, max:100 },
  { key:'english2',  label:'ইংরেজি দ্বিতীয় পত্র',      naib:null, written:'english2',         type:2, max:50  },
  { key:'math',      label:'গণিত',                       naib:null, written:'math_written',     type:1, max:100 },
  { key:'science',   label:'বিজ্ঞান',                    naib:null, written:'science_written',  type:1, max:100 },
  { key:'bgst',      label:'বাংলাদেশ ও বিশ্বপরিচয়',   naib:null, written:'bgst_written',     type:1, max:100 },
  { key:'islam',     label:'ধর্ম',                       naib:null, written:'islam_written',    type:1, max:100 },
  { key:'computer',  label:'কম্পিউটার',                  naib:null, written:'ict',              type:2, max:50  },
  { key:'gk',        label:'সাধারণ জ্ঞান',               naib:null, written:'krishi_written',   type:2, max:50  },
  { key:'drawing',   label:'ছবি অংকন',                  naib:null, written:'physics_written',  type:2, max:50  },
]

// ── Class 5 ──
// বাং১, বাং২, ইং১, ইং২, গণিত, বিজ্ঞান, বাংলাদেশ ও বিশ্বপরিচয়, ধর্ম, ছবি অংকন
// 100 / 100/ 100/ 100/ 100  / 100   / 100                     / 100 / 50
export const SUBJECTS_5 = [
  { key:'bangla1',   label:'বাংলা প্রথম পত্র',          naib:null, written:'bangla1_written',  type:1, max:100 },
  { key:'bangla2',   label:'বাংলা দ্বিতীয় পত্র',       naib:null, written:'bangla2_written',  type:1, max:100 },
  { key:'english1',  label:'ইংরেজি প্রথম পত্র',         naib:null, written:'english1',         type:1, max:100 },
  { key:'english2',  label:'ইংরেজি দ্বিতীয় পত্র',      naib:null, written:'english2',         type:1, max:100 },
  { key:'math',      label:'গণিত',                       naib:null, written:'math_written',     type:1, max:100 },
  { key:'science',   label:'বিজ্ঞান',                    naib:null, written:'science_written',  type:1, max:100 },
  { key:'bgst',      label:'বাংলাদেশ ও বিশ্বপরিচয়',   naib:null, written:'bgst_written',     type:1, max:100 },
  { key:'islam',     label:'ধর্ম',                       naib:null, written:'islam_written',    type:1, max:100 },
  { key:'drawing',   label:'ছবি অংকন',                  naib:null, written:'physics_written',  type:2, max:50  },
]

// ── Class 6-8 ──
export const SUBJECTS_6_8 = [
  {key:'bangla1',  label:'বাংলা প্রথম পত্র',         naib:'bangla1_naib',   written:'bangla1_written',  type:1, max:100},
  {key:'bangla2',  label:'বাংলা দ্বিতীয় পত্র',       naib:'bangla2_naib',   written:'bangla2_written',  type:2, max:50},
  {key:'english1', label:'ইংরেজি প্রথম পত্র',          naib:null,             written:'english1',         type:1, max:100},
  {key:'english2', label:'ইংরেজি দ্বিতীয় পত্র',       naib:null,             written:'english2',         type:2, max:50},
  {key:'math',     label:'গণিত',                       naib:'math_naib',      written:'math_written',     type:1, max:100},
  {key:'science',  label:'বিজ্ঞান',                    naib:'science_naib',   written:'science_written',  type:1, max:100},
  {key:'bgst',     label:'বাওবি',                      naib:'bgst_naib',      written:'bgst_written',     type:1, max:100},
  {key:'islam',    label:'ইসলাম শিক্ষা',               naib:'islam_naib',     written:'islam_written',    type:1, max:100},
  {key:'krishi',   label:'কৃষি শিক্ষা',                naib:'krishi_naib',    written:'krishi_written',   type:1, max:100, isFourth:true},
  {key:'ict',      label:'তথ্য প্রযুক্তি',             naib:null,             written:'ict',              type:3, max:25},
]

// ── Class 9-10 ──
export const SUBJECTS_9_10 = [
  {key:'bangla1',     label:'বাংলা প্রথম পত্র',          naib:'bangla1_naib',      written:'bangla1_written',      type:1, max:100},
  {key:'bangla2',     label:'বাংলা দ্বিতীয় পত্র',        naib:'bangla2_naib',      written:'bangla2_written',      type:2, max:50},
  {key:'english1',    label:'ইংরেজি প্রথম পত্র',           naib:null,                written:'english1',             type:1, max:100},
  {key:'english2',    label:'ইংরেজি দ্বিতীয় পত্র',        naib:null,                written:'english2',             type:1, max:100},
  {key:'math',        label:'গণিত',                        naib:'math_naib',         written:'math_written',         type:1, max:100},
  {key:'physics',     label:'পদার্থবিজ্ঞান',               naib:'physics_naib',      written:'physics_written',      type:4, max:75},
  {key:'chemistry',   label:'রসায়ন',                       naib:'chemistry_naib',    written:'chemistry_written',    type:4, max:75},
  {key:'biology',     label:'জীববিজ্ঞান',                  naib:'biology_naib',      written:'biology_written',      type:4, max:75},
  {key:'higher_math', label:'উচ্চতর গণিত/কৃষিশিক্ষা',    naib:'higher_math_naib',  written:'higher_math_written',  type:4, max:75, isFourth:true},
  {key:'bgst910',     label:'বাংলাদেশ ও বিশ্বপরিচয়',     naib:'bgst_naib',         written:'bgst_written',         type:1, max:100},
  {key:'islam',       label:'ইসলাম শিক্ষা',                naib:'islam_naib',        written:'islam_written',        type:1, max:100},
  {key:'ict',         label:'তথ্য ও যোগাযোগ প্রযুক্তি',  naib:null,                written:'ict',                  type:3, max:25},
]

export const getSubjects = (classNum: string): any[] => {
  const g = CLASS_GROUPS[String(classNum)]?.group
  if (g === 'play-nursery') return SUBJECTS_PLAY
  if (g === '1st')  return SUBJECTS_1
  if (g === '2nd')  return SUBJECTS_2
  if (g === '3rd')  return SUBJECTS_3
  if (g === '4th')  return SUBJECTS_4
  if (g === '5th')  return SUBJECTS_5
  if (g === '6-8')  return SUBJECTS_6_8
  return SUBJECTS_9_10
}

export const calcResult = (student: any): any => {
  const subjects = getSubjects(student.class_num || '9')
  const computed = subjects.map(s => {
    const naib    = s.naib ? (Number(student[s.naib])||0) : 0
    const written = Number(student[s.written])||0
    const total   = s.naib ? naib+written : written
    const grade   = calcGrade(total, s.type)
    const gpa     = gradeToGPA(grade)
    return {...s, naib, written, total, grade, gpa}
  })

  const isLowerClass = ['play-nursery','1st','2nd','3rd','4th','5th'].includes(CLASS_GROUPS[String(student.class_num)]?.group)

  const anyFail    = computed.some(s => s.grade==='F')
  const totalMarks = computed.reduce((a,s)=>a+s.total,0)
  const sumGPA     = computed.reduce((a,s)=>a+s.gpa,0)
  const n          = computed.length
  let cgpa = 0

  if (!anyFail) {
    if (isLowerClass) {
      // No 4th subject for lower classes — simple average
      cgpa = Math.min(5, Math.round((sumGPA / n)*100)/100)
    } else {
      const fourth   = computed.find(s=>s.isFourth)
      const others   = computed.filter(s=>!s.isFourth)
      const minOther = Math.min(...others.map(s=>s.gpa))
      cgpa = Math.min(5,(sumGPA+Math.min(fourth?.gpa??0,minOther))/n)
      cgpa = Math.round(cgpa*100)/100
    }
  }

  return {
    subjects: computed, totalMarks, anyFail, cgpa,
    cgpaGrade: cgpaGrade(cgpa),
    passed: !anyFail && cgpa >= 2,
    isLowerClass,
  }
}

export const GRADE_COLORS: Record<string, {text:string;bg:string;border:string}> = {
  'A+': {text:'#15803d', bg:'#dcfce7', border:'#86efac'},
  'A':  {text:'#166534', bg:'#f0fdf4', border:'#bbf7d0'},
  'A-': {text:'#15803d', bg:'#f0fdf4', border:'#bbf7d0'},
  'B':  {text:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe'},
  'C':  {text:'#92400e', bg:'#fffbeb', border:'#fde68a'},
  'D':  {text:'#9a3412', bg:'#fff7ed', border:'#fed7aa'},
  'F':  {text:'#991b1b', bg:'#fef2f2', border:'#fecaca'},
}
