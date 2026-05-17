import { GRADE_COLORS, CLASS_GROUPS, calcResult } from './grades'

const F = `font-family:'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif;`
export const MS_W = 595

export function buildMarksheetHTML(student) {
  const result = calcResult(student)
  const gc = GRADE_COLORS[result.cgpaGrade] || GRADE_COLORS['F']
  const cl = CLASS_GROUPS[student.class_num]?.label || student.class_num

  const trows = result.subjects.map((s, i) => {
    const c = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
    return `<tr style="background:${i % 2 === 0 ? '#f0fdf8' : '#fff'}">
      <td style="padding:3px 4px;text-align:center;color:#94a3b8;font-size:9px;font-family:monospace">${i + 1}</td>
      <td style="${F}padding:3px 4px;color:#1e293b;font-size:10.5px;font-weight:500">${s.label}${s.isFourth ? `<span style="margin-left:3px;font-size:8px;padding:1px 3px;border-radius:3px;background:#f3e8ff;color:#7e22ce">৪র্থ</span>` : ''}</td>
      <td style="padding:3px 4px;text-align:center;color:#475569;font-family:monospace;font-size:10.5px">${s.naib > 0 ? s.naib : '—'}</td>
      <td style="padding:3px 4px;text-align:center;color:#475569;font-family:monospace;font-size:10.5px">${s.written}</td>
      <td style="padding:3px 4px;text-align:center;font-weight:700;color:#0f172a;font-family:monospace;font-size:11px">${s.total}</td>
      <td style="padding:3px 4px;text-align:center"><span style="padding:1px 5px;border-radius:4px;font-size:8.5px;font-weight:700;background:${c.bg};color:${c.text};border:1px solid ${c.border}">${s.grade}</span></td>
      <td style="padding:3px 4px;text-align:center;font-weight:700;font-family:monospace;color:${c.text};font-size:10.5px">${s.gpa.toFixed(2)}</td>
    </tr>`
  }).join('')

  const grades = [['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']]
    .map(([g, p]) => { const c = GRADE_COLORS[g]; return `<span style="font-size:8.5px;padding:1px 5px;border-radius:4px;font-weight:700;font-family:monospace;background:${c.bg};color:${c.text};border:1px solid ${c.border}">${g}=${p}</span>` }).join('')

  const summary = [['মোট বিষয়', result.subjects.length], ['মোট নম্বর', result.totalMarks], ['সিজিপিএ', result.cgpa.toFixed(2)], ['গ্রেড', result.cgpaGrade]]
    .map(([k, v]) => `<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="${F}font-size:9.5px;color:#64748b">${k}</span><span style="font-size:9.5px;font-weight:700;font-family:monospace;color:#1e293b">${v}</span></div>`).join('')

  return `<div style="width:${MS_W}px;background:#fff;${F}box-sizing:border-box">

  <div style="background:linear-gradient(135deg,#0d9488,#0f766e,#115e59);overflow:hidden">
    <div style="${F}padding:12px 20px 0;text-align:center">
      <div style="width:46px;height:46px;border-radius:12px;margin:0 auto 7px;background:linear-gradient(135deg,#fbbf24,#f59e0b);box-shadow:0 5px 16px rgba(251,191,36,0.4);display:inline-flex;align-items:center;justify-content:center">
        <span style="font-size:22px">🎓</span>
      </div>
      <h1 style="${F}font-size:16px;font-weight:700;color:#fff;margin:0;line-height:1.2">গোল্ডেন লাইফ পাবলিক স্কুল</h1>
      <p style="${F}font-size:9.5px;color:#99f6e4;margin:2px 0 1px">পাইকরতলী, কাজিপুর, সিরাজগঞ্জ | ০১৭৩৩৬৯৬৪৭৭</p>
      <p style="${F}font-size:8.5px;color:#5eead4;margin:0;opacity:0.8">স্থাপিতঃ ২০১৫ | পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম</p>
      <div style="margin:8px -20px 0;padding:5px 20px;background:rgba(255,255,255,0.12);border-top:1px solid rgba(255,255,255,0.25);border-bottom:1px solid rgba(255,255,255,0.25)">
        <p style="${F}font-size:12px;font-weight:700;color:#fff;margin:0">✦ প্রগতি পত্র / মার্কশীট ✦</p>
        ${student.exam_type ? `<p style="${F}font-size:9px;color:rgba(255,255,255,0.75);margin:1px 0 0">${student.exam_type} · ${student.exam_year}</p>` : ''}
      </div>
    </div>
  </div>

  <div style="padding:6px 12px;background:#f0fdfa;border-bottom:2px solid #99f6e4">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px">
      <div style="grid-column:1/-1;padding:5px 9px;background:#fff;border:1px solid #99f6e4;border-radius:7px;border-left:4px solid #0d9488">
        <p style="font-size:7.5px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase;letter-spacing:0.05em">শিক্ষার্থীর নাম</p>
        <p style="${F}font-size:14px;font-weight:700;color:#0f172a;margin:1px 0 0">${student.name}</p>
      </div>
      ${[['শ্রেণি', cl, ''], ['রোল নং', student.roll, ''], ['পরীক্ষার সাল', student.exam_year || '—', ''], ['অবস্থান', result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ', result.passed ? '#15803d' : '#991b1b']].map(([l, v, co]) => `
      <div style="padding:4px 7px;background:#fff;border:1px solid #99f6e4;border-radius:7px${co ? `;border-left:3px solid ${co}` : ''}">
        <p style="font-size:7.5px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase">${l}</p>
        <p style="${F}font-size:11px;font-weight:700;color:${co || '#0f172a'};margin:1px 0 0">${v}</p>
      </div>`).join('')}
    </div>
  </div>

  <div style="padding:6px 10px">
    <table style="width:100%;font-size:10.5px;border-collapse:collapse">
      <thead>
        <tr style="background:linear-gradient(90deg,#0d9488,#0f766e)">
          ${['#', 'বিষয়ের নাম', 'নৈব', 'লিখিত', 'মোট', 'গ্রেড', 'জিপিএ'].map((h, i) => `<th style="${F}padding:6px 4px;color:#fff;font-size:9.5px;font-weight:700;text-align:${i === 1 ? 'left' : 'center'}">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${trows}</tbody>
      <tfoot>
        <tr style="background:linear-gradient(90deg,#0d9488,#0f766e)">
          <td colspan="4" style="${F}padding:6px 9px;text-align:right;color:#fff;font-weight:700;font-size:9.5px">সর্বমোট নম্বর</td>
          <td style="padding:6px 4px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:12px">${result.totalMarks}</td>
          <td style="padding:6px 4px;text-align:center"><span style="padding:1px 6px;border-radius:4px;font-size:8.5px;font-weight:700;background:${gc.bg};color:${gc.text};border:1px solid ${gc.border}">${result.cgpaGrade}</span></td>
          <td style="padding:6px 4px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:12px">${result.cgpa.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div style="margin:0 10px 6px;border-radius:9px;overflow:hidden;border:1.5px solid ${result.passed ? '#6ee7b7' : '#fca5a5'}">
    <div style="background:${result.passed ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#7f1d1d,#991b1b)'};padding:7px 11px;display:flex;align-items:center;gap:10px">
      <div style="flex:1">
        <p style="${F}font-weight:700;color:#fff;font-size:14px;margin:0">${result.passed ? '✓ উত্তীর্ণ' : '✗ অনুত্তীর্ণ'}</p>
        <p style="${F}font-size:9px;color:rgba(255,255,255,0.65);margin:1px 0 0">${result.passed ? 'অভিনন্দন! চমৎকার ফলাফল।' : 'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'}</p>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <p style="font-size:24px;font-weight:700;font-family:monospace;color:${result.passed ? '#34d399' : '#f87171'};margin:0">${result.cgpa.toFixed(2)}</p>
        <p style="${F}font-size:8.5px;color:rgba(255,255,255,0.5);margin:0">সিজিপিএ</p>
      </div>
    </div>
  </div>

  <div style="margin:0 10px 6px;display:grid;grid-template-columns:1fr 1fr;gap:7px">
    <div style="padding:6px 9px;border-radius:9px;background:#f0fdfa;border:1px solid #99f6e4">
      <p style="${F}font-size:8.5px;font-weight:700;margin:0 0 5px;color:#0d9488;text-transform:uppercase">গ্রেড স্কেল</p>
      <div style="display:flex;flex-wrap:wrap;gap:3px">${grades}</div>
    </div>
    <div style="padding:6px 9px;border-radius:9px;background:#f0fdfa;border:1px solid #99f6e4">
      <p style="${F}font-size:8.5px;font-weight:700;margin:0 0 5px;color:#0d9488;text-transform:uppercase">সারসংক্ষেপ</p>
      ${summary}
    </div>
  </div>

  <div style="margin:0 10px 8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
    ${['শিক্ষার্থীর স্বাক্ষর', 'অভিভাবকের স্বাক্ষর', 'অধ্যক্ষের সীলমোহর'].map(l => `
    <div style="text-align:center">
      <div style="height:22px;border-bottom:1px dashed #94a3b8;margin-bottom:3px"></div>
      <p style="${F}font-size:8.5px;color:#94a3b8;margin:0">${l}</p>
    </div>`).join('')}
  </div>

  <div style="padding:5px 12px;text-align:center;background:linear-gradient(90deg,#0d9488,#115e59)">
    <p style="${F}font-size:8.5px;color:#ccfbf1;margin:0">এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
  </div>

</div>`
}

// Opens a new window with the marksheets and triggers Save As PDF via print dialog
export function generatePDF(students, filename) {
  const list = Array.isArray(students) ? students : [students]

  const pagesHTML = list.map((st, i) => {
    const ms = buildMarksheetHTML(st)
    return i === 0 ? ms : `<div style="page-break-before:always">${ms}</div>`
  }).join('')

  const win = window.open('', '_blank', 'width=700,height=900')
  if (!win) { alert('Popup blocked! Browser এ popup allow করুন।'); return }

  win.document.write(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <link rel="stylesheet" href="https://fonts.maateen.me/kalpurush/font.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; width: ${MS_W}px; }
    @page { size: A4 portrait; margin: 0; }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>${pagesHTML}</body>
</html>`)
  win.document.close()

  // Wait for fonts then print
  win.onload = () => {
    setTimeout(() => {
      win.focus()
      win.print()
    }, 800)
  }
}
