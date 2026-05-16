import { GRADE_COLORS, CLASS_GROUPS, calcResult } from './grades'

const BN = `font-family:'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif;`

// W = 794px = A4 width at 96dpi (no margin)
export const MS_WIDTH = 794

export function buildMarksheetHTML(student, opts = {}) {
  const { pageBreak = false } = opts
  const result = calcResult(student)
  const gc = GRADE_COLORS[result.cgpaGrade] || GRADE_COLORS['F']
  const classLabel = CLASS_GROUPS[student.class_num]?.label || student.class_num

  const rows = result.subjects.map((s, i) => {
    const sgc = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
    return `<tr style="background:${i % 2 === 0 ? '#f0fdf8' : '#ffffff'}">
      <td style="padding:6px 7px;text-align:center;color:#94a3b8;font-size:11px;font-family:monospace">${i + 1}</td>
      <td style="${BN}padding:6px 7px;color:#1e293b;font-size:13px;font-weight:500">${s.label}${s.isFourth ? `<span style="margin-left:5px;font-size:9px;padding:1px 5px;border-radius:4px;background:#f3e8ff;color:#7e22ce">৪র্থ</span>` : ''}</td>
      <td style="padding:6px 7px;text-align:center;color:#475569;font-family:monospace;font-size:13px">${s.naib > 0 ? s.naib : '<span style="color:#cbd5e1">—</span>'}</td>
      <td style="padding:6px 7px;text-align:center;color:#475569;font-family:monospace;font-size:13px">${s.written}</td>
      <td style="padding:6px 7px;text-align:center;font-weight:700;color:#0f172a;font-family:monospace;font-size:14px">${s.total}</td>
      <td style="padding:6px 7px;text-align:center"><span style="padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;background:${sgc.bg};color:${sgc.text};border:1px solid ${sgc.border}">${s.grade}</span></td>
      <td style="padding:6px 7px;text-align:center;font-weight:700;font-family:monospace;color:${sgc.text};font-size:13px">${s.gpa.toFixed(2)}</td>
    </tr>`
  }).join('')

  const gradeScale = [['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']]
    .map(([g, p]) => {
      const c = GRADE_COLORS[g]
      return `<span style="font-size:11px;padding:2px 8px;border-radius:5px;font-weight:700;font-family:monospace;background:${c.bg};color:${c.text};border:1px solid ${c.border}">${g}=${p}</span>`
    }).join('')

  const summary = [['মোট বিষয়', result.subjects.length], ['মোট নম্বর', result.totalMarks], ['সিজিপিএ', result.cgpa.toFixed(2)], ['গ্রেড', result.cgpaGrade]]
    .map(([k, v]) => `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="${BN}font-size:12px;color:#64748b">${k}</span><span style="font-size:12px;font-weight:700;font-family:monospace;color:#1e293b">${v}</span></div>`).join('')

  const sigs = ['শিক্ষার্থীর স্বাক্ষর', 'অভিভাবকের স্বাক্ষর', 'অধ্যক্ষের সীলমোহর']
    .map(l => `<div style="text-align:center"><div style="height:34px;border-bottom:1px dashed #94a3b8;margin-bottom:6px"></div><p style="${BN}font-size:11px;color:#94a3b8;margin:0">${l}</p></div>`).join('')

  return `
<div style="width:${MS_WIDTH}px;background:#ffffff;${BN}box-sizing:border-box;${pageBreak ? 'page-break-before:always;' : ''}">

  <!-- HEADER: light teal/green -->
  <div style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 40%,#115e59 100%);position:relative;overflow:hidden">
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>
    <div style="position:absolute;bottom:-20px;left:-20px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,0.04)"></div>
    <div style="${BN}padding:24px 32px 0;text-align:center;position:relative">
      <div style="width:64px;height:64px;border-radius:18px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#fbbf24,#f59e0b);box-shadow:0 10px 30px rgba(251,191,36,0.45)">
        <span style="font-size:30px">🎓</span>
      </div>
      <h1 style="${BN}font-size:22px;font-weight:700;color:#ffffff;margin:0;line-height:1.2;letter-spacing:0.02em">গোল্ডেন লাইফ পাবলিক স্কুল</h1>
      <p style="${BN}font-size:13px;color:#99f6e4;margin:5px 0 2px">পাইকরতলী, কাজিপুর, সিরাজগঞ্জ &nbsp;|&nbsp; ০১৭৩৩৬৯৬৪৭৭</p>
      <p style="${BN}font-size:11px;color:#5eead4;margin:0;opacity:0.8">স্থাপিতঃ ২০১৫ &nbsp;|&nbsp; পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম</p>
      <div style="margin:14px -32px 0;padding:9px 32px;background:rgba(255,255,255,0.12);border-top:1px solid rgba(255,255,255,0.25);border-bottom:1px solid rgba(255,255,255,0.25)">
        <p style="${BN}font-size:15px;font-weight:700;color:#ffffff;margin:0;letter-spacing:0.05em">✦ প্রগতি পত্র / মার্কশীট ✦</p>
        ${student.exam_type ? `<p style="${BN}font-size:12px;color:rgba(255,255,255,0.75);margin:3px 0 0">${student.exam_type} · ${student.exam_year}</p>` : ''}
      </div>
    </div>
  </div>

  <!-- STUDENT INFO -->
  <div style="padding:14px 20px;background:#f0fdfa;border-bottom:2px solid #99f6e4">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">
      <div style="grid-column:1/-1;padding:9px 16px;background:#fff;border:1px solid #99f6e4;border-radius:12px;border-left:5px solid #0d9488">
        <p style="font-size:10px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase;letter-spacing:0.06em">শিক্ষার্থীর নাম</p>
        <p style="${BN}font-size:19px;font-weight:700;color:#0f172a;margin:3px 0 0">${student.name}</p>
      </div>
      ${[['শ্রেণি', classLabel, ''], ['রোল নং', student.roll, ''], ['পরীক্ষার সাল', student.exam_year || '—', ''], ['অবস্থান', result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ', result.passed ? '#15803d' : '#991b1b']].map(([l, v, col]) => `
      <div style="padding:8px 12px;background:#fff;border:1px solid #99f6e4;border-radius:10px${col ? `;border-left:3px solid ${col}` : ''}">
        <p style="font-size:10px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase">${l}</p>
        <p style="${BN}font-size:14px;font-weight:700;color:${col || '#0f172a'};margin:3px 0 0">${v}</p>
      </div>`).join('')}
    </div>
  </div>

  <!-- TABLE -->
  <div style="padding:14px 18px">
    <table style="width:100%;font-size:13px;border-collapse:collapse">
      <thead>
        <tr style="background:linear-gradient(90deg,#0d9488,#0f766e)">
          ${['#', 'বিষয়ের নাম', 'নৈব', 'লিখিত', 'মোট', 'গ্রেড', 'জিপিএ'].map((h, i) => `<th style="${BN}padding:10px 7px;color:#ffffff;font-size:12px;font-weight:700;text-align:${i === 1 ? 'left' : 'center'}">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background:linear-gradient(90deg,#0d9488,#0f766e)">
          <td colspan="4" style="${BN}padding:9px 14px;text-align:right;color:#ffffff;font-weight:700;font-size:12px">সর্বমোট নম্বর</td>
          <td style="padding:9px 7px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:16px">${result.totalMarks}</td>
          <td style="padding:9px 7px;text-align:center"><span style="padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;background:${gc.bg};color:${gc.text};border:1px solid ${gc.border}">${result.cgpaGrade}</span></td>
          <td style="padding:9px 7px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:16px">${result.cgpa.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- RESULT BANNER -->
  <div style="margin:0 18px 10px;border-radius:14px;overflow:hidden;border:2px solid ${result.passed ? '#6ee7b7' : '#fca5a5'}">
    <div style="background:${result.passed ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#7f1d1d,#991b1b)'};padding:13px 18px;display:flex;align-items:center;gap:16px">
      <div style="width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${result.passed ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}">
        <span style="font-size:26px">${result.passed ? '✓' : '✗'}</span>
      </div>
      <div style="flex:1">
        <p style="${BN}font-weight:700;color:#fff;font-size:19px;margin:0">${result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}</p>
        <p style="${BN}font-size:12px;color:rgba(255,255,255,0.65);margin:4px 0 0">${result.passed ? 'অভিনন্দন! চমৎকার ফলাফল।' : 'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'}</p>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <p style="font-size:34px;font-weight:700;font-family:monospace;color:${result.passed ? '#34d399' : '#f87171'};margin:0">${result.cgpa.toFixed(2)}</p>
        <p style="${BN}font-size:11px;color:rgba(255,255,255,0.5);margin:0">সিজিপিএ</p>
      </div>
    </div>
  </div>

  <!-- GRADE + SUMMARY -->
  <div style="margin:0 18px 10px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="padding:12px 14px;border-radius:12px;background:#f0fdfa;border:1px solid #99f6e4">
      <p style="${BN}font-size:11px;font-weight:700;margin:0 0 8px;color:#0d9488;text-transform:uppercase;letter-spacing:0.04em">গ্রেড স্কেল</p>
      <div style="display:flex;flex-wrap:wrap;gap:5px">${gradeScale}</div>
    </div>
    <div style="padding:12px 14px;border-radius:12px;background:#f0fdfa;border:1px solid #99f6e4">
      <p style="${BN}font-size:11px;font-weight:700;margin:0 0 8px;color:#0d9488;text-transform:uppercase;letter-spacing:0.04em">সারসংক্ষেপ</p>
      ${summary}
    </div>
  </div>

  <!-- SIGNATURES -->
  <div style="margin:0 18px 14px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px">
    ${sigs}
  </div>

  <!-- FOOTER -->
  <div style="padding:9px 18px;text-align:center;background:linear-gradient(90deg,#0d9488,#115e59)">
    <p style="${BN}font-size:11px;color:#ccfbf1;margin:0">এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
  </div>

</div>`
}
