import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, GRADE_COLORS, CLASS_GROUPS, EXAM_TYPES } from '../lib/grades'
import { Search, SlidersHorizontal, ChevronRight, Trash2, X, AlertTriangle, Download, FileDown } from 'lucide-react'

const SORTS = [
  {key:'roll',label:'রোল ↑'},{key:'name',label:'নাম A-Z'},
  {key:'cgpa_desc',label:'সিজিপিএ ↓'},{key:'total_desc',label:'মোট ↓'},{key:'pass',label:'পাস আগে'},
]

export default function StudentList() {
  const [students, setStudents]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [query,    setQuery]      = useState('')
  const [sort,     setSort]       = useState('roll')
  const [filter,   setFilter]     = useState('all')
  const [classF,   setClassF]     = useState('all')
  const [yearF,    setYearF]      = useState('all')
  const [examF,    setExamF]      = useState('all')
  const [showSort, setShowSort]   = useState(false)
  const [selected, setSelected]   = useState([])
  const [delMode,  setDelMode]    = useState(false)
  const [selMode,  setSelMode]    = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [pdfBusy,  setPdfBusy]    = useState(false)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('students').select('*')
    if (data) setStudents(data.map(s => ({ ...s, ...calcResult(s) })))
    setLoading(false)
  }

  const years     = [...new Set(students.map(s => s.exam_year))].filter(Boolean).sort().reverse()
  const examTypes = [...new Set(students.filter(s => yearF === 'all' || s.exam_year === yearF).map(s => s.exam_type))].filter(Boolean)

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

  // ── Bulk PDF download ──
  async function downloadBulkPDF() {
    const targets = selMode && selected.length > 0
      ? filtered.filter(s => selected.includes(s.id))
      : filtered

    if (!targets.length) return
    if (!window.html2pdf) {
      setPdfBusy(true)
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      document.head.appendChild(script)
      await new Promise(r => { script.onload = r })
    }
    setPdfBusy(true)

    // Fetch full student data for targets
    const ids = targets.map(s => s.id)
    const { data: fullData } = await supabase.from('students').select('*').in('id', ids)
    if (!fullData) { setPdfBusy(false); return }

    // Build one HTML page per student
    const html = buildBulkHTML(fullData)
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)

    await window.html2pdf().set({
      margin: 0,
      filename: `marksheets_bulk_${targets.length}জন.pdf`,
      image: { type: 'jpeg', quality: 0.97 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'css', before: '.page-break' },
    }).from(container).save()

    document.body.removeChild(container)
    setPdfBusy(false)
  }

  function buildBulkHTML(studentsData) {
    const font = `font-family:'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif;`
    const pages = studentsData.map((student, idx) => {
      const result = calcResult(student)
      const gc = GRADE_COLORS[result.cgpaGrade] || GRADE_COLORS['F']
      const classLabel = CLASS_GROUPS[student.class_num]?.label || student.class_num

      const rows = result.subjects.map((s, i) => {
        const sgc = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
        return `
          <tr style="background:${i%2===0?'#f1f5f9':'#fff'}">
            <td style="padding:3px 4px;text-align:center;color:#94a3b8;font-size:9px;font-family:monospace">${i+1}</td>
            <td style="${font}padding:3px 4px;color:#334155;font-size:10px">${s.label}${s.isFourth?'<span style="margin-left:3px;font-size:7px;padding:1px 3px;border-radius:3px;background:#f3e8ff;color:#7e22ce">৪র্থ</span>':''}</td>
            <td style="padding:3px 4px;text-align:center;color:#64748b;font-family:monospace">${s.naib>0?s.naib:'—'}</td>
            <td style="padding:3px 4px;text-align:center;color:#64748b;font-family:monospace">${s.written}</td>
            <td style="padding:3px 4px;text-align:center;font-weight:700;color:#1e293b;font-family:monospace;font-size:11px">${s.total}</td>
            <td style="padding:3px 4px;text-align:center"><span style="padding:1px 5px;border-radius:4px;font-size:8px;font-weight:700;background:${sgc.bg};color:${sgc.text};border:1px solid ${sgc.border}">${s.grade}</span></td>
            <td style="padding:3px 4px;text-align:center;font-weight:700;font-family:monospace;color:${sgc.text};font-size:9px">${s.gpa.toFixed(2)}</td>
          </tr>`
      }).join('')

      return `
        <div class="${idx>0?'page-break':''}" style="width:794px;background:white;${font}page-break-after:always">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#0a1628 0%,#1a3a5c 55%,#1e5a8e 100%);padding:14px 24px 8px;text-align:center">
            <div style="width:44px;height:44px;border-radius:12px;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f0a500,#fbbf24)">
              <span style="font-size:22px">🎓</span>
            </div>
            <h1 style="${font}font-size:16px;font-weight:700;color:#fff;margin:0">গোল্ডেন লাইফ পাবলিক স্কুল</h1>
            <p style="${font}font-size:10px;color:#bfdbfe;margin:2px 0">পাইকরতলী, কাজিপুর, সিরাজগঞ্জ | ০১৭৩৩৬৯৬৪৭৭</p>
            <div style="margin:6px -24px 0;padding:4px 24px;background:rgba(240,165,0,0.15);border-top:1px solid rgba(240,165,0,0.4);border-bottom:1px solid rgba(240,165,0,0.4)">
              <p style="${font}font-size:12px;font-weight:700;color:#fbbf24;margin:0">✦ প্রগতি পত্র / মার্কশীট ✦</p>
              <p style="${font}font-size:9px;color:rgba(251,191,36,0.72);margin:1px 0 0">${student.exam_type||''} · ${student.exam_year||''}</p>
            </div>
          </div>
          <!-- Info -->
          <div style="padding:6px 14px;background:#f8fafc;border-bottom:2px solid #e2e8f0">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px">
              <div style="grid-column:1/-1;padding:4px 10px;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
                <p style="font-size:8px;color:#94a3b8;margin:0;text-transform:uppercase">শিক্ষার্থীর নাম</p>
                <p style="${font}font-size:14px;font-weight:700;color:#1e293b;margin:1px 0 0">${student.name}</p>
              </div>
              ${[['শ্রেণি',classLabel],['রোল নং',student.roll],['পরীক্ষার সাল',student.exam_year||'—'],['অবস্থান',result.passed?'উত্তীর্ণ':'অনুত্তীর্ণ']].map(([l,v],i)=>`
              <div style="padding:4px 8px;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
                <p style="font-size:8px;color:#94a3b8;margin:0;text-transform:uppercase">${l}</p>
                <p style="${font}font-size:11px;font-weight:700;color:${i===3?(result.passed?'#15803d':'#991b1b'):'#1e293b'};margin:1px 0 0">${v}</p>
              </div>`).join('')}
            </div>
          </div>
          <!-- Table -->
          <div style="padding:6px 12px">
            <table style="width:100%;font-size:10px;border-collapse:collapse">
              <thead>
                <tr style="background:linear-gradient(90deg,#1a3a5c,#1e5a8e)">
                  ${['#','বিষয়ের নাম','নৈব','লিখিত','মোট','গ্রেড','জিপিএ'].map((h,i)=>`<th style="${font}padding:5px 4px;color:#fff;font-size:9px;text-align:${i===1?'left':'center'}">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>${rows}</tbody>
              <tfoot>
                <tr style="background:linear-gradient(90deg,#1a3a5c,#1e5a8e)">
                  <td colspan="4" style="${font}padding:5px 8px;text-align:right;color:#fff;font-weight:700;font-size:9px">সর্বমোট নম্বর</td>
                  <td style="padding:5px 4px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:11px">${result.totalMarks}</td>
                  <td style="padding:5px 4px;text-align:center"><span style="padding:1px 5px;border-radius:4px;font-size:8px;font-weight:700;background:${gc.bg};color:${gc.text};border:1px solid ${gc.border}">${result.cgpaGrade}</span></td>
                  <td style="padding:5px 4px;text-align:center;font-weight:700;font-family:monospace;color:#fbbf24;font-size:11px">${result.cgpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <!-- Result banner -->
          <div style="margin:5px 12px;border-radius:10px;overflow:hidden;border:1.5px solid ${result.passed?'#6ee7b7':'#fca5a5'}">
            <div style="background:${result.passed?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)'};padding:7px 12px;display:flex;align-items:center;gap:10px">
              <div style="flex:1"><p style="${font}font-weight:700;color:#fff;font-size:13px;margin:0">${result.passed?'✓ উত্তীর্ণ':'✗ অনুত্তীর্ণ'}</p></div>
              <p style="font-size:22px;font-weight:700;font-family:monospace;color:${result.passed?'#34d399':'#f87171'};margin:0">${result.cgpa.toFixed(2)}</p>
            </div>
          </div>
          <!-- Signatures -->
          <div style="margin:5px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
            ${['শিক্ষার্থীর স্বাক্ষর','অভিভাবকের স্বাক্ষর','অধ্যক্ষের সীলমোহর'].map(l=>`
            <div style="text-align:center">
              <div style="height:22px;border-bottom:1px dashed #94a3b8;margin-bottom:3px"></div>
              <p style="${font}font-size:8px;color:#94a3b8;margin:0">${l}</p>
            </div>`).join('')}
          </div>
          <!-- Footer -->
          <div style="padding:5px 12px;text-align:center;background:linear-gradient(90deg,#0a1628,#1a3a5c);margin-top:5px">
            <p style="${font}font-size:8.5px;color:#93c5fd;margin:0">এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
          </div>
        </div>`
    })
    return pages.join('')
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
      case 'roll':       s.sort((a, b) => a.roll - b.roll); break
      case 'name':       s.sort((a, b) => a.name.localeCompare(b.name, 'bn')); break
      case 'cgpa_desc':  s.sort((a, b) => b.cgpa - a.cgpa); break
      case 'total_desc': s.sort((a, b) => b.totalMarks - a.totalMarks); break
      case 'pass':       s.sort((a, b) => (b.passed ? 1 : 0) - (a.passed ? 1 : 0)); break
    }
    return s
  }, [students, query, sort, filter, classF, yearF, examF])

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3 glass-dark space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input type="search" placeholder="নাম বা রোল খুঁজুন..." value={query}
            onChange={e => setQuery(e.target.value)} className="input-field pl-10 pr-10 py-2.5"/>
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={16} className="text-slate-500"/></button>}
        </div>

        {years.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <Pill active={yearF === 'all'} onClick={() => { setYearF('all'); setExamF('all') }}>সব বছর</Pill>
            {years.map(y => <Pill key={y} active={yearF === y} onClick={() => { setYearF(y); setExamF('all') }}>{y}</Pill>)}
          </div>
        )}
        {yearF !== 'all' && examTypes.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <Pill active={examF === 'all'} onClick={() => setExamF('all')} small>সব পরীক্ষা</Pill>
            {examTypes.map(e => <Pill key={e} active={examF === e} onClick={() => setExamF(e)} small>{e}</Pill>)}
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <Pill active={classF === 'all'} onClick={() => setClassF('all')}>সব শ্রেণি</Pill>
          {Object.entries(CLASS_GROUPS).map(([n, c]) => (
            <Pill key={n} active={classF === n} onClick={() => setClassF(n)}>{c.label}</Pill>
          ))}
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {[['all','সব'],['pass','উত্তীর্ণ'],['fail','অনুত্তীর্ণ']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`bangla text-xs px-3 py-1.5 rounded-lg transition-all ${filter===v?'gold-gradient text-navy-900 font-semibold':'glass text-slate-400'}`}>{l}</button>
          ))}
          <div className="ml-auto flex gap-2">
            {/* Bulk PDF button */}
            <button onClick={downloadBulkPDF} disabled={pdfBusy}
              className="glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-gold-400 disabled:opacity-40">
              <FileDown size={13}/><span className="bangla">{pdfBusy ? '...' : selMode && selected.length ? `${selected.length}টি PDF` : 'সব PDF'}</span>
            </button>
            {/* Select mode */}
            <button onClick={() => { setSelMode(!selMode); setSelected([]) }}
              className={`glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${selMode ? 'text-blue-400' : 'text-slate-400'}`}>
              <Download size={13}/><span className="bangla">বেছে নিন</span>
            </button>
            <button onClick={() => { setDelMode(!delMode); setSelected([]) }}
              className={`glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${delMode ? 'text-rose-400' : 'text-slate-400'}`}>
              <Trash2 size={13}/><span className="bangla">মুছুন</span>
            </button>
            <button onClick={() => setShowSort(!showSort)}
              className={`glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${showSort ? 'text-gold-400' : 'text-slate-400'}`}>
              <SlidersHorizontal size={13}/><span className="bangla">সাজান</span>
            </button>
          </div>
        </div>

        {showSort && (
          <div className="grid grid-cols-3 gap-1.5 animate-slide-up">
            {SORTS.map(({ key, label }) => (
              <button key={key} onClick={() => { setSort(key); setShowSort(false) }}
                className={`bangla text-xs py-2 px-2 rounded-lg text-center transition-all ${sort===key?'bg-gold-500/20 text-gold-400 border border-gold-500/30':'glass text-slate-400'}`}>{label}</button>
            ))}
          </div>
        )}

        {(delMode || selMode) && (
          <div className={`flex items-center gap-3 p-3 rounded-xl animate-slide-up ${delMode?'bg-rose-500/10 border border-rose-500/20':'bg-blue-500/10 border border-blue-500/20'}`}>
            <button onClick={() => setSelected(filtered.map(s => s.id))}
              className="text-xs text-slate-400 bangla underline">সব সিলেক্ট</button>
            <span className={`text-xs bangla ${delMode?'text-rose-400':'text-blue-400'}`}>{selected.length} টি সিলেক্ট</span>
            {delMode && (
              <button onClick={deleteSelected} disabled={!selected.length || deleting}
                className="ml-auto bg-rose-500 text-white text-xs px-3 py-1.5 rounded-lg bangla disabled:opacity-40">
                {deleting ? 'মুছছে...' : 'মুছে ফেলুন'}
              </button>
            )}
            {selMode && selected.length > 0 && (
              <button onClick={downloadBulkPDF} disabled={pdfBusy}
                className="ml-auto bg-gold-500 text-navy-900 text-xs px-3 py-1.5 rounded-lg bangla font-semibold disabled:opacity-40">
                {pdfBusy ? 'তৈরি হচ্ছে...' : `${selected.length}টি PDF ডাউনলোড`}
              </button>
            )}
          </div>
        )}

        <p className="text-xs text-slate-600 bangla">{filtered.length} জন পাওয়া গেছে</p>
      </div>

      {/* List */}
      <div className="flex-1 px-4 pb-4 space-y-2 mt-2">
        {loading
          ? [...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-navy-800/50 animate-pulse"/>)
          : filtered.length === 0
            ? <div className="text-center py-16 text-slate-600 bangla">কিছু পাওয়া যায়নি</div>
            : filtered.map(s => (
              <div key={s.id} className={`flex items-center gap-2 rounded-xl transition-all
                ${delMode && selected.includes(s.id) ? 'ring-1 ring-rose-500/50 bg-rose-500/5' : ''}
                ${selMode && selected.includes(s.id) ? 'ring-1 ring-blue-500/50 bg-blue-500/5' : ''}`}>
                {(delMode || selMode) && (
                  <button onClick={e => toggleSelect(s.id, e)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                      ${selected.includes(s.id)
                        ? delMode ? 'bg-rose-500 border-rose-500' : 'bg-blue-500 border-blue-500'
                        : 'border-slate-600'}`}>
                    {selected.includes(s.id) && <span className="text-white text-xs">✓</span>}
                  </button>
                )}
                <button onClick={() => !(delMode || selMode) && navigate(`/marksheet/${s.id}`)}
                  className="flex-1 flex items-center gap-3 p-3.5 rounded-xl glass hover:bg-white/5 transition-all active:scale-[0.98] text-left">
                  <div className="w-11 h-11 rounded-xl bg-navy-800/80 flex flex-col items-center justify-center flex-shrink-0 border border-white/5">
                    <span className="text-sm font-bold font-mono text-gold-400 leading-none">{s.roll}</span>
                    <span className="text-[9px] text-slate-600 bangla">{CLASS_GROUPS[s.class_num]?.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white bangla truncate">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold bangla ${s.passed?'bg-emerald-500/15 text-emerald-400':'bg-rose-500/15 text-rose-400'}`}>
                        {s.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
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
                  {!(delMode || selMode) && <ChevronRight size={14} className="text-slate-600 flex-shrink-0"/>}
                  {delMode && <button onClick={e => deleteOne(s.id, e)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400"><Trash2 size={14}/></button>}
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
