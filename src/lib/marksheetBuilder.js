import { GRADE_COLORS, CLASS_GROUPS, calcResult } from './grades'

export const MS_W = 595
const BN = "font-family:'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif;"

function el(tag, style, content) {
  return '<' + tag + (style ? ' style="' + style + '"' : '') + '>' + (content || '') + '</' + tag + '>'
}

function div(style, content) { return el('div', style, content) }
function p(style, content)   { return el('p',   style, content) }
function span(style, content){ return el('span',style, content) }
function td(style, content)  { return el('td',  style, content) }
function th(style, content)  { return el('th',  style, content) }

export function buildMarksheetHTML(student, opts) {
  const pageBreak = (opts && opts.pageBreak) || false
  const result    = calcResult(student)
  const gc        = GRADE_COLORS[result.cgpaGrade] || GRADE_COLORS['F']
  const cl        = (CLASS_GROUPS[student.class_num] && CLASS_GROUPS[student.class_num].label) || student.class_num

  // ── table rows ──
  var trows = ''
  for (var i = 0; i < result.subjects.length; i++) {
    var s   = result.subjects[i]
    var c   = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
    var bg  = i % 2 === 0 ? '#f0fdf8' : '#fff'
    var nth = s.isFourth
      ? s.label + span('margin-left:4px;font-size:8px;padding:1px 4px;border-radius:3px;background:#f3e8ff;color:#7e22ce', '৪র্থ')
      : s.label
    var naibVal = s.naib > 0 ? String(s.naib) : '—'
    var gradeSpan = span('padding:2px 6px;border-radius:5px;font-size:9px;font-weight:700;background:' + c.bg + ';color:' + c.text + ';border:1px solid ' + c.border, s.grade)
    trows += el('tr', 'background:' + bg,
      td('padding:4px 5px;text-align:center;color:#94a3b8;font-size:10px;font-family:monospace', String(i + 1)) +
      td(BN + 'padding:4px 5px;color:#1e293b;font-size:11px;font-weight:500', nth) +
      td('padding:4px 5px;text-align:center;color:#475569;font-family:monospace;font-size:11px', naibVal) +
      td('padding:4px 5px;text-align:center;color:#475569;font-family:monospace;font-size:11px', String(s.written)) +
      td('padding:4px 5px;text-align:center;font-weight:700;color:#0f172a;font-family:monospace;font-size:12px', String(s.total)) +
      td('padding:4px 5px;text-align:center', gradeSpan) +
      td('padding:4px 5px;text-align:center;font-weight:700;font-family:monospace;color:' + c.text + ';font-size:11px', s.gpa.toFixed(2))
    )
  }

  // ── grade scale ──
  var gradeList = [['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']]
  var grades = ''
  for (var gi = 0; gi < gradeList.length; gi++) {
    var g = gradeList[gi][0], gp = gradeList[gi][1]
    var gc2 = GRADE_COLORS[g]
    grades += span('font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;font-family:monospace;background:' + gc2.bg + ';color:' + gc2.text + ';border:1px solid ' + gc2.border, g + '=' + gp)
  }

  // ── summary ──
  var sumRows = [['মোট বিষয়', result.subjects.length], ['মোট নম্বর', result.totalMarks], ['সিজিপিএ', result.cgpa.toFixed(2)], ['গ্রেড', result.cgpaGrade]]
  var summary = ''
  for (var si = 0; si < sumRows.length; si++) {
    summary += div('display:flex;justify-content:space-between;margin-bottom:3px',
      span(BN + 'font-size:10px;color:#64748b', sumRows[si][0]) +
      span('font-size:10px;font-weight:700;font-family:monospace;color:#1e293b', String(sumRows[si][1]))
    )
  }

  // ── info cells ──
  var infoCells = [
    ['শ্রেণি', cl, ''],
    ['রোল নং', String(student.roll), ''],
    ['পরীক্ষার সাল', student.exam_year || '—', ''],
    ['অবস্থান', result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ', result.passed ? '#15803d' : '#991b1b']
  ]
  var infoHTML = ''
  for (var ii = 0; ii < infoCells.length; ii++) {
    var iLabel = infoCells[ii][0], iVal = infoCells[ii][1], iCol = infoCells[ii][2]
    var iStyle = 'padding:5px 8px;background:#fff;border:1px solid #99f6e4;border-radius:8px' + (iCol ? ';border-left:3px solid ' + iCol : '')
    infoHTML += div(iStyle,
      p('font-size:8px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase', iLabel) +
      p(BN + 'font-size:12px;font-weight:700;color:' + (iCol || '#0f172a') + ';margin:2px 0 0', iVal)
    )
  }

  // ── signatures ──
  var sigLabels = ['শিক্ষার্থীর স্বাক্ষর', 'অভিভাবকের স্বাক্ষর', 'অধ্যক্ষের সীলমোহর']
  var sigs = ''
  for (var sgi = 0; sgi < sigLabels.length; sgi++) {
    sigs += div('text-align:center',
      div('height:26px;border-bottom:1px dashed #94a3b8;margin-bottom:4px', '') +
      p(BN + 'font-size:9px;color:#94a3b8;margin:0', sigLabels[sgi])
    )
  }

  // ── table headers ──
  var thLabels = ['#', 'বিষয়ের নাম', 'নৈব', 'লিখিত', 'মোট', 'গ্রেড', 'জিপিএ']
  var theads = ''
  for (var ti = 0; ti < thLabels.length; ti++) {
    theads += th(BN + 'padding:7px 5px;color:#fff;font-size:10px;font-weight:700;text-align:' + (ti === 1 ? 'left' : 'center'), thLabels[ti])
  }

  // ── exam type line ──
  var examLine = student.exam_type
    ? p(BN + 'font-size:10px;color:rgba(255,255,255,0.75);margin:2px 0 0', student.exam_type + ' · ' + student.exam_year)
    : ''

  // ── result banner ──
  var bannerBg   = result.passed ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#7f1d1d,#991b1b)'
  var bannerBdr  = result.passed ? '#6ee7b7' : '#fca5a5'
  var cgpaColor  = result.passed ? '#34d399' : '#f87171'
  var passText   = result.passed ? '✓ উত্তীর্ণ' : '✗ অনুত্তীর্ণ'
  var passSubText= result.passed ? 'অভিনন্দন! চমৎকার ফলাফল।' : 'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'

  var banner = div('margin:0 12px 8px;border-radius:10px;overflow:hidden;border:2px solid ' + bannerBdr,
    div('background:' + bannerBg + ';padding:9px 12px;display:flex;align-items:center;gap:10px',
      div('flex:1',
        p(BN + 'font-weight:700;color:#fff;font-size:15px;margin:0', passText) +
        p(BN + 'font-size:10px;color:rgba(255,255,255,0.65);margin:2px 0 0', passSubText)
      ) +
      div('text-align:right;flex-shrink:0',
        p('font-size:26px;font-weight:700;font-family:monospace;color:' + cgpaColor + ';margin:0', result.cgpa.toFixed(2)) +
        p(BN + 'font-size:9px;color:rgba(255,255,255,0.5);margin:0', 'সিজিপিএ')
      )
    )
  )

  var wrapStyle = 'width:' + MS_W + 'px;background:#fff;' + BN + 'box-sizing:border-box;' + (pageBreak ? 'page-break-before:always;' : '')

  return div(wrapStyle,
    // HEADER
    div('background:linear-gradient(135deg,#0d9488,#0f766e,#115e59);overflow:hidden',
      div(BN + 'padding:16px 22px 0;text-align:center',
        div('width:52px;height:52px;border-radius:14px;margin:0 auto 8px;background:linear-gradient(135deg,#fbbf24,#f59e0b);box-shadow:0 6px 20px rgba(251,191,36,0.4);display:inline-flex;align-items:center;justify-content:center',
          span('font-size:24px', '🎓')
        ) +
        el('h1', BN + 'font-size:17px;font-weight:700;color:#fff;margin:0;line-height:1.2', 'গোল্ডেন লাইফ পাবলিক স্কুল') +
        p(BN + 'font-size:10px;color:#99f6e4;margin:3px 0 2px', 'পাইকরতলী, কাজিপুর, সিরাজগঞ্জ | ০১৭৩৩৬৯৬৪৭৭') +
        p(BN + 'font-size:9px;color:#5eead4;margin:0;opacity:0.8', 'স্থাপিতঃ ২০১৫ | পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম') +
        div('margin:10px -22px 0;padding:6px 22px;background:rgba(255,255,255,0.12);border-top:1px solid rgba(255,255,255,0.25);border-bottom:1px solid rgba(255,255,255,0.25)',
          p(BN + 'font-size:13px;font-weight:700;color:#fff;margin:0', '✦ প্রগতি পত্র / মার্কশীট ✦') +
          examLine
        )
      )
    ) +
    // INFO
    div('padding:8px 14px;background:#f0fdfa;border-bottom:2px solid #99f6e4',
      div('display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px',
        div('grid-column:1/-1;padding:6px 10px;background:#fff;border:1px solid #99f6e4;border-radius:8px;border-left:4px solid #0d9488',
          p('font-size:8px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase;letter-spacing:0.05em', 'শিক্ষার্থীর নাম') +
          p(BN + 'font-size:15px;font-weight:700;color:#0f172a;margin:2px 0 0', student.name)
        ) + infoHTML
      )
    ) +
    // TABLE
    div('padding:8px 12px',
      el('table', 'width:100%;font-size:11px;border-collapse:collapse',
        el('thead', null, el('tr', 'background:linear-gradient(90deg,#0d9488,#0f766e)', theads)) +
        el('tbody', null, trows) +
        el('tfoot', null,
          el('tr', 'background:linear-gradient(90deg,#0d9488,#0f766e)',
            td(BN + 'padding:7px 10px;text-align:right;color:#fff;font-weight:700;font-size:10px;colspan:4', 'সর্বমোট নম্বর') +
            td('padding:7px 5px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:13px', String(result.totalMarks)) +
            td('padding:7px 5px;text-align:center', span('padding:2px 7px;border-radius:5px;font-size:9px;font-weight:700;background:' + gc.bg + ';color:' + gc.text + ';border:1px solid ' + gc.border, result.cgpaGrade)) +
            td('padding:7px 5px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:13px', result.cgpa.toFixed(2))
          )
        )
      )
    ) +
    // RESULT BANNER
    banner +
    // GRADE + SUMMARY
    div('margin:0 12px 8px;display:grid;grid-template-columns:1fr 1fr;gap:8px',
      div('padding:8px 10px;border-radius:10px;background:#f0fdfa;border:1px solid #99f6e4',
        p(BN + 'font-size:9px;font-weight:700;margin:0 0 6px;color:#0d9488;text-transform:uppercase', 'গ্রেড স্কেল') +
        div('display:flex;flex-wrap:wrap;gap:4px', grades)
      ) +
      div('padding:8px 10px;border-radius:10px;background:#f0fdfa;border:1px solid #99f6e4',
        p(BN + 'font-size:9px;font-weight:700;margin:0 0 6px;color:#0d9488;text-transform:uppercase', 'সারসংক্ষেপ') +
        summary
      )
    ) +
    // SIGNATURES
    div('margin:0 12px 10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px', sigs) +
    // FOOTER
    div('padding:6px 14px;text-align:center;background:linear-gradient(90deg,#0d9488,#115e59)',
      p(BN + 'font-size:9px;color:#ccfbf1;margin:0', 'এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ')
    )
  )
}

export function generatePDF(students, filename) {
  var list = Array.isArray(students) ? students : [students]
  var html = ''
  for (var i = 0; i < list.length; i++) {
    html += buildMarksheetHTML(list[i], { pageBreak: i > 0 })
  }

  var win = window.open('', '_blank', 'width=700,height=900')
  if (!win) { alert('Popup blocked! Please allow popups.'); return }

  win.document.write('<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>' + filename + '</title><link rel="preconnect" href="https://fonts.maateen.me"><link rel="stylesheet" href="https://fonts.maateen.me/kalpurush/font.css"><style>*{box-sizing:border-box;margin:0;padding:0}body{background:white;font-family:Kalpurush,SolaimanLipi,sans-serif}@page{size:A4 portrait;margin:0}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}</style></head><body>' + html + '</body></html>')
  win.document.close()
  win.addEventListener('load', function() {
    setTimeout(function() { win.focus(); win.print() }, 1200)
  })
}
