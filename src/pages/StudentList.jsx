import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, GRADE_COLORS, CLASS_GROUPS } from '../lib/grades'
import { generatePDF } from '../lib/marksheetBuilder'
import { Search, SlidersHorizontal, ChevronRight, Trash2, X, FileDown, Download } from 'lucide-react'

const SORTS = [
  { key:'roll',       label:'রোল ↑' },
  { key:'name',       label:'নাম A-Z' },
  { key:'cgpa_desc',  label:'সিজিপিএ ↓' },
  { key:'total_desc', label:'মোট ↓' },
  { key:'pass',       label:'পাস আগে' },
]

export default function StudentList() {
  const [students, setStudents] = useState([])   // raw DB rows only
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
    // store raw rows — compute result on the fly in render
    if (data) setStudents(data)
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
    if (!confirm('মুছে ফেলবেন?')) return
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
    try {
      const { data } = await supabase.from('students').select('*').in('id', targets.map(s => s.id))
      if (!data) throw new Error('no data')
      // preserve filtered order
      data.sort((a, b) => targets.findIndex(s => s.id === a.id) - targets.findIndex(s => s.id === b.id))
      await generatePDF(data, `marksheets_${targets.length}জন.pdf`)
    } catch(e) { alert('PDF error: ' + e.message) }
    setPdfBusy(false)
  }

  // compute results in memo — never stored in state
  const withResult = useMemo(() => students.map(s => ({ s, r: calcResult(s) })), [students])

  const filtered = useMemo(() => {
    let arr = [...withResult]
    if (yearF  !== 'all') arr = arr.filter(({ s }) => s.exam_year === yearF)
    if (examF  !== 'all') arr = arr.filter(({ s }) => s.exam_type === examF)
    if (classF !== 'all') arr = arr.filter(({ s }) => String(s.class_num) === classF)
    if (filter === 'pass') arr = arr.filter(({ r }) => r.passed)
    if (filter === 'fail') arr = arr.filter(({ r }) => !r.passed)
    if (query) {
      const q = query.toLowerCase()
      arr = arr.filter(({ s }) => s.name.toLowerCase().includes(q) || String(s.roll).includes(q))
    }
    switch (sort) {
      case 'roll':       arr.sort((a, b) => a.s.roll - b.s.roll); break
      case 'name':       arr.sort((a, b) => a.s.name.localeCompare(b.s.name, 'bn')); break
      case 'cgpa_desc':  arr.sort((a, b) => b.r.cgpa - a.r.cgpa); break
      case 'total_desc': arr.sort((a, b) => b.r.totalMarks - a.r.totalMarks); break
      case 'pass':       arr.sort((a, b) => (b.r.passed ? 1 : 0) - (a.r.passed ? 1 : 0)); break
    }
    return arr
  }, [withResult, query, sort, filter, classF, yearF, examF])

  return (
    <div className="flex flex-col min-h-full">

      {/* ── sticky header ── */}
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
              className={`bangla text-xs px-3 py-1.5 rounded-lg transition-all ${filter === v ? 'gold-gradient text-navy-900 font-semibold' : 'glass text-slate-400'}`}>{l}</button>
          ))}
          <div className="ml-auto flex gap-2 flex-wrap justify-end">
            <button onClick={downloadBulkPDF} disabled={pdfBusy}
              className="glass text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-gold-400 disabled:opacity-40">
              <FileDown size={13}/><span className="bangla">{pdfBusy ? 'তৈরি...' : selMode && selected.length ? `${selected.length}টি PDF` : 'সব PDF'}</span>
            </button>
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
          <div className="grid grid-cols-3 gap-1.5">
            {SORTS.map(({ key, label }) => (
              <button key={key} onClick={() => { setSort(key); setShowSort(false) }}
                className={`bangla text-xs py-2 px-2 rounded-lg text-center transition-all ${sort === key ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'glass text-slate-400'}`}>{label}</button>
            ))}
          </div>
        )}

        {(delMode || selMode) && (
          <div className={`flex items-center gap-3 p-3 rounded-xl ${delMode ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
            <button onClick={() => setSelected(filtered.map(({ s }) => s.id))} className="text-xs text-slate-400 bangla underline">সব সিলেক্ট</button>
            <span className={`text-xs bangla ${delMode ? 'text-rose-400' : 'text-blue-400'}`}>{selected.length} টি</span>
            {delMode && (
              <button onClick={deleteSelected} disabled={!selected.length || deleting}
                className="ml-auto bg-rose-500 text-white text-xs px-3 py-1.5 rounded-lg bangla disabled:opacity-40">
                {deleting ? 'মুছছে...' : 'মুছে ফেলুন'}
              </button>
            )}
            {selMode && selected.length > 0 && (
              <button onClick={downloadBulkPDF} disabled={pdfBusy}
                className="ml-auto bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg bangla font-semibold disabled:opacity-40">
                {pdfBusy ? 'তৈরি...' : `${selected.length}টি PDF`}
              </button>
            )}
          </div>
        )}

        <p className="text-xs text-slate-600 bangla">{filtered.length} জন পাওয়া গেছে</p>
      </div>

      {/* ── list ── */}
      <div className="flex-1 px-4 pb-4 space-y-2 mt-2">
        {loading
          ? [...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-navy-800/50 animate-pulse"/>)
          : filtered.length === 0
            ? <div className="text-center py-16 text-slate-600 bangla">কিছু পাওয়া যায়নি</div>
            : filtered.map(({ s, r }) => {
                const gc = GRADE_COLORS[r.cgpaGrade] || GRADE_COLORS['F']
                return (
                  <div key={s.id} className={`flex items-center gap-2 rounded-xl transition-all
                    ${delMode && selected.includes(s.id) ? 'ring-1 ring-rose-500/50 bg-rose-500/5' : ''}
                    ${selMode && selected.includes(s.id) ? 'ring-1 ring-blue-500/50 bg-blue-500/5' : ''}`}>
                    {(delMode || selMode) && (
                      <button onClick={e => toggleSelect(s.id, e)}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                          ${selected.includes(s.id) ? (delMode ? 'bg-rose-500 border-rose-500' : 'bg-blue-500 border-blue-500') : 'border-slate-600'}`}>
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
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold bangla ${r.passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                            {r.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                          </span>
                          <span className="text-xs text-slate-500 bangla">মোট {r.totalMarks}</span>
                          {s.exam_type && <span className="text-[10px] text-slate-600 bangla truncate max-w-[80px]">{s.exam_type}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 mr-1">
                        <span className="text-lg font-bold font-mono" style={{ color: gc.text }}>{r.cgpa.toFixed(2)}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                          style={{ background: gc.bg, color: gc.text }}>{r.cgpaGrade}</span>
                      </div>
                      {!(delMode || selMode) && <ChevronRight size={14} className="text-slate-600 flex-shrink-0"/>}
                      {delMode && (
                        <button onClick={e => deleteOne(s.id, e)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </button>
                  </div>
                )
              })}
      </div>
    </div>
  )
}

function Pill({ active, onClick, children, small }) {
  return (
    <button onClick={onClick} className={`bangla whitespace-nowrap rounded-lg transition-all flex-shrink-0 ${small ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'} ${active ? 'gold-gradient text-navy-900 font-semibold' : 'glass text-slate-400'}`}>
      {children}
    </button>
  )
}
