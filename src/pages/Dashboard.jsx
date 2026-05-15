import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, CLASS_GROUPS, EXAM_TYPES } from '../lib/grades'
import { Trophy, TrendingUp, Users, Star, ChevronRight, GraduationCap, Calendar, BookOpen } from 'lucide-react'

export default function Dashboard() {
  const [all, setAll]           = useState([])
  const [years, setYears]       = useState([])
  const [selYear, setSelYear]   = useState('')
  const [selExam, setSelExam]   = useState('')
  const [selClass, setSelClass] = useState('all')
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const {data} = await supabase.from('students').select('*').order('roll')
    if (data && data.length > 0) {
      const withR = data.map(s => ({...s, ...calcResult(s)}))
      setAll(withR)
      // Extract unique years
      const ys = [...new Set(data.map(s => s.exam_year))].sort().reverse()
      setYears(ys)
      setSelYear(ys[0] || '')
      // Default exam
      const exs = [...new Set(data.map(s => s.exam_type))].filter(Boolean)
      setSelExam(exs[0] || EXAM_TYPES[0])
    }
    setLoading(false)
  }

  const filtered = all.filter(s =>
    (!selYear  || s.exam_year  === selYear) &&
    (!selExam  || s.exam_type  === selExam) &&
    (selClass === 'all' || String(s.class_num) === selClass)
  )

  const passed   = filtered.filter(r => r.passed)
  const aPlus    = filtered.filter(r => r.cgpaGrade === 'A+')
  const avgCGPA  = filtered.length ? (filtered.reduce((a,r)=>a+r.cgpa,0)/filtered.length).toFixed(2) : '0.00'
  const passRate = filtered.length ? ((passed.length/filtered.length)*100).toFixed(1) : '0'
  const top5     = [...filtered].sort((a,b)=>b.cgpa-a.cgpa||b.totalMarks-a.totalMarks).slice(0,5)
  // Get unique exam types for current year
  const examTypes = selYear ? [...new Set(all.filter(s=>s.exam_year===selYear).map(s=>s.exam_type))].filter(Boolean) : []

  if (loading) return <Skeleton />

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950"/>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 70% 30%, #f0a500 0%, transparent 60%)'}}/>
        <div className="relative p-5">
          <p className="text-gold-400 text-xs font-medium bangla mb-1 flex items-center gap-1.5">
            <GraduationCap size={12}/> গোল্ডেন লাইফ পাবলিক স্কুল
          </p>
          <h2 className="font-display text-xl font-bold text-white bangla">ফলাফল ড্যাশবোর্ড</h2>
          <p className="text-slate-400 text-sm mt-1 bangla">{all.length} জন মোট শিক্ষার্থী</p>
        </div>
      </div>

      {/* Year selector */}
      {years.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gold-400"/>
            <span className="text-xs font-semibold text-slate-300 bangla">বছর ও পরীক্ষা বেছে নিন</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {years.map(y => (
              <button key={y} onClick={()=>{setSelYear(y); setSelExam('')}}
                className={`bangla whitespace-nowrap text-sm px-4 py-2 rounded-xl font-medium transition-all flex-shrink-0 ${selYear===y?'gold-gradient text-navy-900':'glass text-slate-400'}`}>
                {y}
              </button>
            ))}
          </div>
          {examTypes.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {examTypes.map(e => (
                <button key={e} onClick={()=>setSelExam(e)}
                  className={`bangla whitespace-nowrap text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${selExam===e?'bg-navy-700 text-gold-400 border border-gold-500/30':'glass text-slate-500'}`}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Class filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Pill active={selClass==='all'} onClick={()=>setSelClass('all')}>সব শ্রেণি</Pill>
        {Object.entries(CLASS_GROUPS).map(([n,c])=>(
          <Pill key={n} active={selClass===n} onClick={()=>setSelClass(n)}>{c.label}</Pill>
        ))}
      </div>

      {filtered.length > 0 ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users}      color="blue"   label="মোট শিক্ষার্থী" value={filtered.length} suffix=""/>
            <StatCard icon={TrendingUp} color="green"  label="পাসের হার"       value={passRate}        suffix="%"/>
            <StatCard icon={Trophy}     color="gold"   label="A+ প্রাপ্ত"      value={aPlus.length}    suffix=" জন"/>
            <StatCard icon={Star}       color="purple" label="গড় সিজিপিএ"     value={avgCGPA}         suffix=""/>
          </div>

          {/* Pass/Fail bar */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 bangla">উত্তীর্ণ / অনুত্তীর্ণ</h3>
            <div className="flex rounded-xl overflow-hidden h-8">
              <div className="bg-emerald-500 flex items-center justify-center text-xs font-bold text-white transition-all" style={{width:`${passRate}%`}}>{passed.length}</div>
              <div className="bg-rose-500 flex items-center justify-center text-xs font-bold text-white transition-all" style={{width:`${100-parseFloat(passRate)}%`}}>{filtered.length-passed.length}</div>
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bangla"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/>উত্তীর্ণ {passed.length}</span>
              <span className="flex items-center gap-1.5 bangla"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"/>অনুত্তীর্ণ {filtered.length-passed.length}</span>
            </div>
          </div>

          {/* Top 5 */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 bangla flex items-center gap-2"><Trophy size={14} className="text-gold-400"/>শীর্ষ শিক্ষার্থী</h3>
            {top5.map((s,i)=>(
              <button key={s.id} onClick={()=>navigate(`/marksheet/${s.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-navy-900/40 hover:bg-navy-800/40 transition-all text-left">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${i===0?'bg-gold-500 text-navy-900':i===1?'bg-slate-400 text-navy-900':i===2?'bg-amber-700 text-white':'glass text-slate-400'}`}>{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white bangla truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 bangla">রোল {s.roll} · {CLASS_GROUPS[s.class_num]?.label} · {s.totalMarks}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gold-400 font-mono">{s.cgpa.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">{s.cgpaGrade}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600"/>
              </button>
            ))}
            <button onClick={()=>navigate('/students')} className="w-full text-center text-xs text-gold-400 py-1 bangla">সব ছাত্রছাত্রী →</button>
          </div>
        </>
      ) : (
        <EmptyState navigate={navigate} />
      )}
    </div>
  )
}

function Pill({active, onClick, children}) {
  return (
    <button onClick={onClick} className={`bangla whitespace-nowrap text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${active?'gold-gradient text-navy-900 font-semibold':'glass text-slate-400'}`}>{children}</button>
  )
}
function StatCard({icon:Icon, color, label, value, suffix}) {
  const c = {blue:'from-blue-500/20 to-blue-900/10 border-blue-500/20 text-blue-400',green:'from-emerald-500/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400',gold:'from-gold-500/20 to-gold-900/10 border-gold-500/20 text-gold-400',purple:'from-purple-500/20 to-purple-900/10 border-purple-500/20 text-purple-400'}[color]
  return <div className={`rounded-2xl p-4 bg-gradient-to-br border ${c} space-y-2`}><Icon size={16}/><p className="text-2xl font-bold font-mono text-white">{value}{suffix}</p><p className="text-[11px] text-slate-400 bangla">{label}</p></div>
}
function EmptyState({navigate}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center animate-float shadow-lg shadow-gold-500/30"><GraduationCap size={28} className="text-navy-900"/></div>
      <div><h3 className="font-display text-lg font-bold text-white bangla">কোনো ডেটা নেই</h3><p className="text-sm text-slate-500 mt-1 bangla">ছাত্র যোগ করুন বা Excel আপলোড করুন</p></div>
      <div className="flex gap-3">
        <button onClick={()=>navigate('/add')} className="btn-primary text-sm bangla">যোগ করুন</button>
        <button onClick={()=>navigate('/upload')} className="btn-ghost text-sm bangla">আপলোড</button>
      </div>
    </div>
  )
}
function Skeleton() {
  return <div className="flex flex-col gap-4 p-4 animate-pulse"><div className="h-28 rounded-2xl bg-navy-800/50"/><div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_,i)=><div key={i} className="h-24 rounded-2xl bg-navy-800/50"/>)}</div></div>
}
