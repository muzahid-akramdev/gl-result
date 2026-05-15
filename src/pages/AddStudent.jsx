import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CLASS_GROUPS, EXAM_TYPES, getSubjects } from '../lib/grades'
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp, Calendar, BookOpen } from 'lucide-react'

export default function AddStudent() {
  const [classNum, setClassNum] = useState('9')
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString())
  const [examType, setExamType] = useState(EXAM_TYPES[1]) // নির্বাচনি
  const [form, setForm]         = useState({roll:'', name:''})
  const [marks, setMarks]       = useState({})
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [expanded, setExpanded] = useState(null)
  const navigate = useNavigate()

  const subjects  = getSubjects(classNum)
  const setM = (k,v) => setMarks(p=>({...p,[k]:v}))
  const years = Array.from({length:6},(_,i)=>(new Date().getFullYear()-i).toString())

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.roll||!form.name) { setError('রোল নম্বর ও নাম আবশ্যক'); return }
    setSaving(true); setError('')
    const payload = {
      roll:Number(form.roll), name:form.name.trim(),
      class_num:classNum, exam_year:examYear, exam_type:examType,
    }
    subjects.forEach(s => {
      if (s.naib) payload[s.naib] = Number(marks[s.naib]||0)
      payload[s.written] = Number(marks[s.written]||0)
    })
    const {data, error:err} = await supabase.from('students').insert([payload]).select().single()
    setSaving(false)
    if (err) { setError('সংরক্ষণ ব্যর্থ: '+err.message); return }
    setSuccess(true)
    setTimeout(()=>navigate(`/marksheet/${data.id}`),1000)
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-scale-in">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <CheckCircle size={32} className="text-emerald-400"/>
      </div>
      <p className="bangla text-lg font-semibold text-white">সফলভাবে সংরক্ষিত!</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Info card */}
      <div className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-gold-400 bangla">শিক্ষার্থীর তথ্য</h2>

        {/* Year select */}
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 flex items-center gap-1.5 block"><Calendar size={11}/>পরীক্ষার সাল</label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {years.map(y=>(
              <button key={y} type="button" onClick={()=>setExamYear(y)}
                className={`bangla text-sm px-3 py-1.5 rounded-lg font-medium flex-shrink-0 transition-all ${examYear===y?'gold-gradient text-navy-900':'glass text-slate-400'}`}>{y}</button>
            ))}
          </div>
        </div>

        {/* Exam type */}
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 flex items-center gap-1.5 block"><BookOpen size={11}/>পরীক্ষার ধরন</label>
          <div className="flex flex-col gap-1.5">
            {EXAM_TYPES.map(e=>(
              <button key={e} type="button" onClick={()=>setExamType(e)}
                className={`bangla text-sm px-3 py-2 rounded-lg text-left transition-all ${examType===e?'bg-navy-700 text-gold-400 border border-gold-500/30':'glass text-slate-400'}`}>{e}</button>
            ))}
          </div>
        </div>

        {/* Class */}
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 block">শ্রেণি</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CLASS_GROUPS).map(([n,c])=>(
              <button key={n} type="button" onClick={()=>setClassNum(n)}
                className={`bangla text-sm px-4 py-2 rounded-xl font-medium transition-all ${classNum===n?'gold-gradient text-navy-900':'glass text-slate-400'}`}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Roll & Name */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-slate-400 bangla mb-1 block">রোল *</label>
            <input type="number" value={form.roll} onChange={e=>setForm(p=>({...p,roll:e.target.value}))}
              className="input-field" placeholder="১" required/>
          </div>
          <div className="col-span-3">
            <label className="text-xs text-slate-400 bangla mb-1 block">নাম *</label>
            <input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
              className="input-field bangla" placeholder="ছাত্রের নাম" required/>
          </div>
        </div>
      </div>

      {/* Subjects */}
      {subjects.map((s,idx)=>{
        const nv = s.naib?(Number(marks[s.naib])||0):0
        const wv = Number(marks[s.written])||0
        const total = s.naib?nv+wv:wv
        const isOpen = expanded===idx
        return (
          <div key={s.key} className={`card transition-all ${isOpen?'ring-1 ring-gold-500/30':''}`}>
            <button type="button" onClick={()=>setExpanded(isOpen?null:idx)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${total>0?'bg-gold-500/20 text-gold-400':'bg-navy-800 text-slate-600'}`}>{total||'—'}</div>
                <span className="bangla text-sm font-medium text-white">{s.label}</span>
                {s.isFourth&&<span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 bangla">৪র্থ বিষয়</span>}
              </div>
              {isOpen?<ChevronUp size={16} className="text-slate-500"/>:<ChevronDown size={16} className="text-slate-500"/>}
            </button>
            {isOpen&&(
              <div className="mt-4 grid grid-cols-2 gap-3 animate-slide-up">
                {s.naib&&(
                  <div>
                    <label className="text-xs text-slate-400 bangla mb-1 block">নৈবত্তিক</label>
                    <input type="number" min="0" max={s.max} value={marks[s.naib]||''}
                      onChange={e=>setM(s.naib,e.target.value)} className="input-field" placeholder="০"/>
                  </div>
                )}
                <div className={s.naib?'':'col-span-2'}>
                  <label className="text-xs text-slate-400 bangla mb-1 block">লিখিত</label>
                  <input type="number" min="0" max={s.max} value={marks[s.written]||''}
                    onChange={e=>setM(s.written,e.target.value)} className="input-field" placeholder="০"/>
                </div>
                <div className="col-span-2 flex justify-between px-1">
                  <span className="text-xs text-slate-500 bangla">সর্বোচ্চ: {s.max}</span>
                  <span className="text-sm font-bold font-mono text-gold-400">মোট: {total}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {error&&(
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm bangla">
          <AlertCircle size={16}/>{error}
        </div>
      )}
      <button type="submit" disabled={saving} className="w-full btn-primary py-4 text-base bangla disabled:opacity-50">
        {saving?'সংরক্ষণ হচ্ছে...':'সংরক্ষণ করুন ও মার্কশিট দেখুন'}
      </button>
    </form>
  )
}
