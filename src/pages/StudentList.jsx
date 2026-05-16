import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, GRADE_COLORS, CLASS_GROUPS, EXAM_TYPES } from '../lib/grades'
import { Search, SlidersHorizontal, ChevronRight, Trash2, X, FileDown, Download } from 'lucide-react'

const SORTS = [
  {key:'roll',label:'রোল ↑'},{key:'name',label:'নাম A-Z'},
  {key:'cgpa_desc',label:'সিজিপিএ ↓'},{key:'total_desc',label:'মোট ↓'},{key:'pass',label:'পাস আগে'},
]

const BN = `font-family:'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif;`

function buildMarksheetHTML(student) {
  const result = calcResult(student)
  const gc = GRADE_COLORS[result.cgpaGrade] || GRADE_COLORS['F']
  const classLabel = CLASS_GROUPS[student.class_num]?.label || student.class_num

  const rows = result.subjects.map((s, i) => {
    const sgc = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
    return `<tr style="background:${i%2===0?'#f8fafc':'#fff'}">
      <td style="padding:5px 6px;text-align:center;color:#94a3b8;font-size:10px;font-family:monospace">${i+1}</td>
      <td style="${BN}padding:5px 6px;color:#1e293b;font-size:12px;font-weight:500">${s.label}${s.isFourth?`<span style="margin-left:4px;font-size:9px;padding:1px 5px;border-radius:4px;background:#f3e8ff;color:#7e22ce">৪র্থ</span>`:''}</td>
      <td style="padding:5px 6px;text-align:center;color:#475569;font-family:monospace;font-size:12px">${s.naib>0?s.naib:'—'}</td>
      <td style="padding:5px 6px;text-align:center;color:#475569;font-family:monospace;font-size:12px">${s.written}</td>
      <td style="padding:5px 6px;text-align:center;font-weight:700;color:#0f172a;font-family:monospace;font-size:13px">${s.total}</td>
      <td style="padding:5px 6px;text-align:center"><span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:${sgc.bg};color:${sgc.text};border:1px solid ${sgc.border}">${s.grade}</span></td>
      <td style="padding:5px 6px;text-align:center;font-weight:700;font-family:monospace;color:${sgc.text};font-size:12px">${s.gpa.toFixed(2)}</td>
    </tr>`
  }).join('')

  return `
  <div style="width:210mm;min-height:297mm;background:white;${BN}box-sizing:border-box;padding:0;page-break-after:always">
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);position:relative;overflow:hidden">
      <div style="${BN}padding:18px 24px 0;text-align:center;position:relative">
        <div style="width:56px;height:56px;border-radius:16px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f59e0b,#fcd34d);box-shadow:0 8px 24px rgba(245,158,11,0.4)">
          <span style="font-size:26px">🎓</span>
        </div>
        <h1 style="${BN}font-size:20px;font-weight:700;color:#fef3c7;margin:0;line-height:1.2">গোল্ডেন লাইফ পাবলিক স্কুল</h1>
        <p style="${BN}font-size:12px;color:#fde68a;margin:4px 0 2px;opacity:0.85">পাইকরতলী, কাজিপুর, সিরাজগঞ্জ | ০১৭৩৩৬৯৬৪৭৭</p>
        <p style="${BN}font-size:11px;color:#fde68a;margin:0;opacity:0.6">স্থাপিতঃ ২০১৫ | পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম</p>
        <div style="margin:12px -24px 0;padding:8px 24px;background:rgba(245,158,11,0.2);border-top:1px solid rgba(245,158,11,0.5);border-bottom:1px solid rgba(245,158,11,0.5)">
          <p style="${BN}font-size:14px;font-weight:700;color:#fcd34d;margin:0">✦ প্রগতি পত্র / মার্কশীট ✦</p>
          <p style="${BN}font-size:11px;color:rgba(252,211,77,0.75);margin:3px 0 0">${student.exam_type||''} · ${student.exam_year||''}</p>
        </div>
      </div>
    </div>

    <!-- INFO -->
    <div style="padding:10px 16px;background:#f0f4f8;border-bottom:2px solid #cbd5e1">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:7px">
        <div style="grid-column:1/-1;padding:7px 14px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;border-left:4px solid #f59e0b">
          <p style="font-size:9px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase;letter-spacing:0.06em">শিক্ষার্থীর নাম</p>
          <p style="${BN}font-size:17px;font-weight:700;color:#1e293b;margin:2px 0 0">${student.name}</p>
        </div>
        ${[['শ্রেণি',classLabel,''],['রোল নং',student.roll,''],['পরীক্ষার সাল',student.exam_year||'—',''],['অবস্থান',result.passed?'উত্তীর্ণ':'অনুত্তীর্ণ',result.passed?'#15803d':'#991b1b']].map(([l,v,col])=>`
        <div style="padding:6px 10px;background:#fff;border:1px solid #cbd5e1;border-radius:10px${col?`;border-left:3px solid ${col}`:''}">
          <p style="font-size:9px;font-weight:600;color:#94a3b8;margin:0;text-transform:uppercase">${l}</p>
          <p style="${BN}font-size:13px;font-weight:700;color:${col||'#1e293b'};margin:2px 0 0">${v}</p>
        </div>`).join('')}
      </div>
    </div>

    <!-- TABLE -->
    <div style="padding:10px 14px">
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <thead>
          <tr style="background:linear-gradient(90deg,#0f3460,#1a5276)">
            ${['#','বিষয়ের নাম','নৈব','লিখিত','মোট','গ্রেড','জিপিএ'].map((h,i)=>`<th style="${BN}padding:8px 6px;color:#fef3c7;font-size:11px;text-align:${i===1?'left':'center'}">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:linear-gradient(90deg,#0f3460,#1a5276)">
            <td colspan="4" style="${BN}padding:8px 12px;text-align:right;color:#fef3c7;font-weight:700;font-size:11px">সর্বমোট নম্বর</td>
            <td style="padding:8px 6px;text-align:center;font-weight:700;font-family:monospace;color:#fcd34d;font-size:14px">${result.totalMarks}</td>
            <td style="padding:8px 6px;text-align:center"><span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:${gc.bg};color:${gc.text};border:1px solid ${gc.border}">${result.cgpaGrade}</span></td>
            <td style="padding:8px 6px;text-align:center;font-weight:700;font-family:monospace;color:#fcd34d;font-size:14px">${result.cgpa.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- RESULT BANNER -->
    <div style="margin:4px 14px 8px;border-radius:12px;overflow:hidden;border:2px solid ${result.passed?'#6ee7b7':'#fca5a5'}">
      <div style="background:${result.passed?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)'};padding:10px 16px;display:flex;align-items:center;gap:14px">
        <div style="flex:1">
          <p style="${BN}font-weight:700;color:#fff;font-size:17px;margin:0">${result.passed?'✓ উত্তীর্ণ':'✗ অনুত্তীর্ণ'}</p>
          <p style="${BN}font-size:11px;color:rgba(255,255,255,0.65);margin:3px 0 0">${result.passed?'অভিনন্দন! চমৎকার ফলাফল।':'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'}</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:30px;font-weight:700;font-family:monospace;color:${result.passed?'#34d399':'#f87171'};margin:0">${result.cgpa.toFixed(2)}</p>
          <p style="${BN}font-size:10px;color:rgba(255,255,255,0.5);margin:0">সিজিপিএ</p>
        </div>
      </div>
    </div>

    <!-- GRADE + SUMMARY -->
    <div style="margin:0 14px 8px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="padding:10px 12px;border-radius:12px;background:#f8fafc;border:1px solid #cbd5e1">
        <p style="${BN}font-size:10px;font-weight:700;margin:0 0 7px;color:#64748b;text-transform:uppercase">গ্রেড স্কেল</p>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${[['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']].map(([g,p])=>{
            const c=GRADE_COLORS[g];return `<span style="font-size:10px;padding:2px 7px;border-radius:5px;font-weight:700;font-family:monospace;background:${c.bg};color:${c.text};border:1px solid ${c.border}">${g}=${p}</span>`
          }).join('')}
        </div>
      </div>
      <div style="padding:10px 12px;border-radius:12px;background:#f8fafc;border:1px solid #cbd5e1">
        <p style="${BN}font-size:10px;font-weight:700;margin:0 0 7px;color:#64748b;text-transform:uppercase">সারসংক্ষেপ</p>
        ${[['মোট বিষয়',result.subjects.length],['মোট নম্বর',result.totalMarks],['সিজিপিএ',result.cgpa.toFixed(2)],['গ্রেড',result.cgpaGrade]].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span style="${BN}font-size:11px;color:#64748b">${k}</span>
          <span style="font-size:11px;font-weight:700;font-family:monospace;color:#1e293b">${v}</span>
        </div>`).join('')}
      </div>
    </div>

    <!-- SIGNATURES -->
    <div style="margin:0 14px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px">
      ${['শিক্ষার্থীর স্বাক্ষর','অভিভাবকের স্বাক্ষর','অধ্যক্ষের সীলমোহর'].map(l=>`
      <div style="text-align:center">
        <div style="height:30px;border-bottom:1px dashed #94a3b8;margin-bottom:5px"></div>
        <p style="${BN}font-size:10px;color:#94a3b8;margin:0">${l}</p>
      </div>`).join('')}
    </div>

    <!-- FOOTER -->
    <div style="padding:7px 16px;text-align:center;background:linear-gradient(90deg,#1a1a2e,#0f3460)">
      <p style="${BN}font-size:10px;color:#fde68a;margin:0;opacity:0.8">এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
    </div>
  </div>`
}

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')
  const [sort,     setSort]     = useState('roll')
  const [filter,   setFilter]   = useState('all')
  const [classF,   setClassF]   = useState('all')
  const [yearF,    setYearF]    = useState('all')
  const [examF,    setExamF]    = useState('all')
  const [showSort, setShowSort] = useState(false)
  const [selected, setSelected] = useState([])
  const [delMode,  setDelMode]  = useState(false)
  const [selMode,  setSelMode]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pdfBusy,  setPdfBusy]  = useState(false)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('students').select('*')
    if (data) setStudents(data.map(s => ({ ...s, ...calcResult(s) })))
    setLoading(false)
  }

  const years     = [...new Set(students.map(s => s.exam_year))].filter(Boolean).sort().reverse()
  const examTypes = [...new Set(students.filter(s => yearF==='all'||s.exam_year===yearF).map(s => s.exam_type))].filter(Boolean)

  async function deleteSelected() {
    if (!selected.length) return
    if (!confirm(`${selected.length} জনকে মুছে ফেলবেন?`)) return
    setDeleting(true)
    await supabase.from('students').delete().in('id', selected)
    setStudents(p => p.filter(s => !selected.includes(s.id)))
    setSelected([]); setDelMode(false); setDeleting(false)
  }

  async function deleteOne(id, e) {
    e.stopPropagation()
    if (!confirm('এই শিক্ষার্থীকে মুছে ফেলবেন?')) return
    await supabase.from('students').delete().eq('id', id)
    setStudents(p => p.filter(s => s.id !== id))
  }

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  async function downloadBulkPDF() {
    const targets = selMode && selected.length > 0
      ? filtered.filter(s => selected.includes(s.id))
      : filtered
    if (!targets.length) return
    setPdfBusy(true)

    if (!window.html2pdf) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      document.head.appendChild(script)
      await new Promise(r => { script.onload = r })
    }

    // fetch full data
    const { data: fullData } = await supabase.from('students').select('*').in('id', targets.map(s => s.id))
    if (!fullData) { setPdfBusy(false); return }

    // sort same as filtered
    fullData.sort((a, b) => {
      const ai = targets.findIndex(s => s.id === a.id)
      const bi = targets.findIndex(s => s.id === b.id)
      return ai - bi
    })

    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1'
    wrapper.innerHTML = fullData.map(s => buildMarksheetHTML(s)).join('')
    document.body.appendChild(wrapper)

    await window.html2pdf().set({
      margin: 0,
      filename: `marksheets_${targets.length}জন.pdf`,
      image: { type: 'jpeg', quality: 0.97 },
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'css', after: 'div' },
    }).from(wrapper).save()

    document.body.removeChild(wrapper)
    setPdfBusy(false)
  }

  const filtered = useMemo(() => {
    let s = [...students]
    if (yearF !== 'all') s = s.filter(st => st.exam_year === yearF)
    if (examF !== 'all') s = s.filter(st => st.exam_type === examF)
    if (classF !== 'all') s = s.filter(st => String(st.class_num) === classF)
    if (filter === 'pass') s = s.filter(st => st.passed)
    if (filter === 'fail') s = s.filter(st => !st.passed)
    if (query) { const q = query.toLowerCase(); s = s.filter(st => st.name.toLowerCase().includes(q) || String(st.roll).includes(q)) }
    switch (sort) {
      case 'roll':       s.sort((a,b) => a.roll-b.roll); break
      case 'name':       s.sort((a,b) => a.name.localeCompare(b.name,'bn')); break
      case 'cgpa_desc':  s.sort((a,b) => b.cgpa-a.cgpa); break
      case 'total_desc': s.sort((a,b) => b.totalMarks-a.totalMarks); break
      case 'pass':       s.sort((a,b) => (b.passed?1:0)-(a.passed?1:0)); break
    }
    return s
  }, [students, query, sort, filter, classF, yearF, examF])

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3 glass-dark space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input type="search" placeholder="নাম বা রোল খুঁজুন..." value={query}
            onChange={e => setQuery(e.target.value)} className="input-field pl-10 pr-10 py-2.5"/>
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={16} className="text-slate-500"/></button>}
        </div>

        {years.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <Pill active={yearF==='all'} onClick={() => { setYearF('all'); setExamF('all') }}>সব বছর</Pill>
            {years.map(y => <Pill key={y} active={yearF===y} onClick={() => { setYearF(y); setExamF('all') }}>{y}</Pill>)}
          </div>
        )}
        {yearF !== 'all' && examTypes.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <Pill active={examF==='all'} onClick={() => setExamF('all')} small>সব পরীক্ষা</Pill>
            {examTypes.map(e => <Pill key={e} active={examF===e} onClick={() => setExamF(e)} small>{e}</Pill>)}
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <Pill active={classF==='all'} onClick={() => setClassF('all')}>সব শ্রেণি</Pill>
          {Object.entries(CLASS_GROUPS).map(([n,c]) => (
            <Pill key={n} active={classF===n} onClick={() => setClassF(n)}>{c.label}</Pill>
          ))}
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {[['all','সব'],['pass','উত্তীর্ণ'],['fail','অনুত্তীর্ণ']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`bangla text-xs px-3 py-1.5 rounded-lg transition-all ${filter===v?'gold-gradient text-navy-900 font-semibold':'glass text-slate-400'}`}>{l}</button>
          ))}
          <div className="ml-auto flex gap-2 flex-wrap justify-end">
            <button onClick={downloadBulkPDF} disabled={pdfBusy}
              className="glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-gold-400 disabled:opacity-40">
              <FileDown size={13}/><span className="bangla">{pdfBusy ? 'তৈরি...' : selMode && selected.length ? `${selected.length}টি PDF` : 'সব PDF'}</span>
            </button>
            <button onClick={() => { setSelMode(!selMode); setSelected([]) }}
              className={`glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${selMode?'text-blue-400':'text-slate-400'}`}>
              <Download size={13}/><span className="bangla">বেছে নিন</span>
            </button>
            <button onClick={() => { setDelMode(!delMode); setSelected([]) }}
              className={`glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${delMode?'text-rose-400':'text-slate-400'}`}>
              <Trash2 size={13}/><span className="bangla">মুছুন</span>
            </button>
            <button onClick={() => setShowSort(!showSort)}
              className={`glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${showSort?'text-gold-400':'text-slate-400'}`}>
              <SlidersHorizontal size={13}/><span className="bangla">সাজান</span>
            </button>
          </div>
        </div>

        {showSort && (
          <div className="grid grid-cols-3 gap-1.5 animate-slide-up">
            {SORTS.map(({key,label}) => (
              <button key={key} onClick={() => { setSort(key); setShowSort(false) }}
                className={`bangla text-xs py-2 px-2 rounded-lg text-center transition-all ${sort===key?'bg-gold-500/20 text-gold-400 border border-gold-500/30':'glass text-slate-400'}`}>{label}</button>
            ))}
          </div>
        )}

        {(delMode || selMode) && (
          <div className={`flex items-center gap-3 p-3 rounded-xl animate-slide-up ${delMode?'bg-rose-500/10 border border-rose-500/20':'bg-blue-500/10 border border-blue-500/20'}`}>
            <button onClick={() => setSelected(filtered.map(s => s.id))} className="text-xs text-slate-400 bangla underline">সব সিলেক্ট</button>
            <span className={`text-xs bangla ${delMode?'text-rose-400':'text-blue-400'}`}>{selected.length} টি সিলেক্ট</span>
            {delMode && (
              <button onClick={deleteSelected} disabled={!selected.length||deleting}
                className="ml-auto bg-rose-500 text-white text-xs px-3 py-1.5 rounded-lg bangla disabled:opacity-40">
                {deleting?'মুছছে...':'মুছে ফেলুন'}
              </button>
            )}
            {selMode && selected.length > 0 && (
              <button onClick={downloadBulkPDF} disabled={pdfBusy}
                className="ml-auto bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg bangla font-semibold disabled:opacity-40">
                {pdfBusy?'তৈরি হচ্ছে...':`${selected.length}টি PDF ডাউনলোড`}
              </button>
            )}
          </div>
        )}
        <p className="text-xs text-slate-600 bangla">{filtered.length} জন পাওয়া গেছে</p>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-2 mt-2">
        {loading
          ? [...Array(5)].map((_,i) => <div key={i} className="h-20 rounded-xl bg-navy-800/50 animate-pulse"/>)
          : filtered.length === 0
            ? <div className="text-center py-16 text-slate-600 bangla">কিছু পাওয়া যায়নি</div>
            : filtered.map(s => (
              <div key={s.id} className={`flex items-center gap-2 rounded-xl transition-all
                ${delMode && selected.includes(s.id) ? 'ring-1 ring-rose-500/50 bg-rose-500/5' : ''}
                ${selMode && selected.includes(s.id) ? 'ring-1 ring-blue-500/50 bg-blue-500/5' : ''}`}>
                {(delMode || selMode) && (
                  <button onClick={e => toggleSelect(s.id, e)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                      ${selected.includes(s.id) ? (delMode?'bg-rose-500 border-rose-500':'bg-blue-500 border-blue-500') : 'border-slate-600'}`}>
                    {selected.includes(s.id) && <span className="text-white text-xs">✓</span>}
                  </button>
                )}
                <button onClick={() => !(delMode||selMode) && navigate(`/marksheet/${s.id}`)}
                  className="flex-1 flex items-center gap-3 p-3.5 rounded-xl glass hover:bg-white/5 transition-all active:scale-[0.98] text-left">
                  <div className="w-11 h-11 rounded-xl bg-navy-800/80 flex flex-col items-center justify-center flex-shrink-0 border border-white/5">
                    <span className="text-sm font-bold font-mono text-gold-400 leading-none">{s.roll}</span>
                    <span className="text-[9px] text-slate-600 bangla">{CLASS_GROUPS[s.class_num]?.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white bangla truncate">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold bangla ${s.passed?'bg-emerald-500/15 text-emerald-400':'bg-rose-500/15 text-rose-400'}`}>
                        {s.passed?'উত্তীর্ণ':'অনুত্তীর্ণ'}
                      </span>
                      <span className="text-xs text-slate-500 bangla">মোট {s.totalMarks}</span>
                      {s.exam_type && <span className="text-[10px] text-slate-600 bangla truncate max-w-[80px]">{s.exam_type}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 mr-1">
                    <span className="text-lg font-bold font-mono" style={{ color: GRADE_COLORS[s.cgpaGrade]?.text }}>{s.cgpa.toFixed(2)}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ background: GRADE_COLORS[s.cgpaGrade]?.bg, color: GRADE_COLORS[s.cgpaGrade]?.text }}>{s.cgpaGrade}</span>
                  </div>
                  {!(delMode||selMode) && <ChevronRight size={14} className="text-slate-600 flex-shrink-0"/>}
                  {delMode && <button onClick={e => deleteOne(s.id,e)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400"><Trash2 size={14}/></button>}
                </button>
              </div>
            ))}
      </div>
    </div>
  )
}

function Pill({ active, onClick, children, small }) {
  return (
    <button onClick={onClick} className={`bangla whitespace-nowrap rounded-lg transition-all flex-shrink-0 ${small?'text-[11px] px-2.5 py-1':'text-xs px-3 py-1.5'} ${active?'gold-gradient text-navy-900 font-semibold':'glass text-slate-400'}`}>{children}</button>
  )
}
