import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, GRADE_COLORS, CLASS_GROUPS } from '../lib/grades'
import { ArrowLeft, Printer, Share2, GraduationCap, Award, AlertCircle, Trash2 } from 'lucide-react'

export default function Marksheet() {
  const {id} = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('students').select('*').eq('id',id).single().then(({data})=>{
      if (data) { setStudent(data); setResult(calcResult(data)) }
      setLoading(false)
    })
  }, [id])

  async function handleDelete() {
    if (!confirm('এই মার্কশিট মুছে ফেলবেন?')) return
    await supabase.from('students').delete().eq('id',id)
    navigate('/students')
  }

  async function handleShare() {
    if (navigator.share) await navigator.share({
      title:`${student.name} - মার্কশিট`,
      text:`রোল: ${student.roll} | CGPA: ${result.cgpa.toFixed(2)} | ${result.passed?'Pass':'Fail'}`,
    })
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"/></div>
  if (!student||!result) return <div className="text-center py-20 text-slate-500 bangla">তথ্য পাওয়া যায়নি</div>

  const gc = GRADE_COLORS[result.cgpaGrade]||GRADE_COLORS['F']
  const classLabel = CLASS_GROUPS[student.class_num]?.label || student.class_num

  return (
    <>
      {/* Action bar */}
      <div className="no-print sticky top-0 z-30 glass-dark px-4 py-3 flex items-center gap-2">
        <button onClick={()=>navigate(-1)} className="w-9 h-9 glass rounded-xl flex items-center justify-center"><ArrowLeft size={18}/></button>
        <span className="flex-1 text-sm font-semibold text-white bangla truncate">{student.name}</span>
        <button onClick={handleShare} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400"><Share2 size={16}/></button>
        <button onClick={handleDelete} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-rose-400"><Trash2 size={15}/></button>
        <button onClick={()=>window.print()} className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm bangla"><Printer size={15}/>প্রিন্ট</button>
      </div>

      {/* Marksheet — designed to fit A4 single page */}
      <div className="p-3 pb-8 print:p-0 print:pb-0">
        <div className="marksheet mx-auto max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/40 animate-scale-in print:rounded-none print:shadow-none print:max-w-none">

          {/* Header */}
          <div className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#0f1e2d 0%,#1a3a5c 60%,#2d6a9f 100%)'}}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" style={{background:'#f0a500'}}/>
            <div className="relative px-5 pt-4 pb-3 text-center">
              <div className="w-11 h-11 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-lg" style={{background:'linear-gradient(135deg,#f0a500,#fbbf24)'}}>
                <GraduationCap size={22} color="#0f1e2d"/>
              </div>
              <h1 className="bangla text-base font-bold text-white leading-tight">গোল্ডেন লাইফ পাবলিক স্কুল</h1>
              <p className="bangla text-[10px] text-blue-200 mt-0.5">পাইকরতলী, কাজিপুর, সিরাজগঞ্জ  |  ০১৭৩৩৬৯৬৪৭৭</p>
              <p className="bangla text-[10px] text-blue-300 mt-0.5">স্থাপিতঃ ২০১৫  |  পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম</p>
              <div className="mt-2 mx-[-20px] px-5 py-1.5" style={{background:'rgba(240,165,0,0.18)',borderTop:'1px solid rgba(240,165,0,0.35)',borderBottom:'1px solid rgba(240,165,0,0.35)'}}>
                <p className="bangla text-xs font-bold text-gold-300">প্রগতি পত্র / মার্কশীট</p>
                {student.exam_type&&<p className="bangla text-[10px] text-gold-400/80 mt-0.5">{student.exam_type} · {student.exam_year}</p>}
              </div>
            </div>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="col-span-3 bg-white rounded-lg p-2 border border-slate-200">
              <p className="text-[9px] text-slate-400 bangla">নাম</p>
              <p className="bangla text-sm font-bold text-slate-800 truncate">{student.name}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <p className="text-[9px] text-slate-400 bangla">শ্রেণি</p>
              <p className="bangla text-sm font-bold text-slate-800">{classLabel}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <p className="text-[9px] text-slate-400 bangla">রোল</p>
              <p className="font-bold text-slate-800 font-mono text-sm">{student.roll}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <p className="text-[9px] text-slate-400 bangla">সাল</p>
              <p className="font-bold text-slate-800 font-mono text-sm">{student.exam_year||'—'}</p>
            </div>
          </div>

          {/* Table */}
          <div className="px-3 py-3">
            <table className="w-full" style={{fontSize:'10px',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#1a3a5c'}}>
                  {['#','বিষয়','নৈব','লিখিত','মোট','গ্রেড','জিপিএ'].map((h,i)=>(
                    <th key={h} className={`py-2 px-1 bangla text-white font-semibold ${i===1?'text-left':'text-center'}`}
                      style={{fontSize:'9px'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((s,i)=>{
                  const sgc = GRADE_COLORS[s.grade]||GRADE_COLORS['F']
                  return (
                    <tr key={s.key} style={{background:i%2===0?'#f1f5f9':'#fff'}}>
                      <td className="py-1.5 px-1 text-center text-slate-400 font-mono">{i+1}</td>
                      <td className="py-1.5 px-1 bangla font-medium text-slate-700" style={{fontSize:'9.5px'}}>{s.label}</td>
                      <td className="py-1.5 px-1 text-center font-mono text-slate-600">{s.naib||<span style={{color:'#cbd5e1'}}>—</span>}</td>
                      <td className="py-1.5 px-1 text-center font-mono text-slate-600">{s.written}</td>
                      <td className="py-1.5 px-1 text-center font-bold font-mono text-slate-800">{s.total}</td>
                      <td className="py-1.5 px-1 text-center">
                        <span className="px-1 py-0.5 rounded text-[9px] font-bold"
                          style={{background:sgc.bg,color:sgc.text,border:`1px solid ${sgc.border}`}}>{s.grade}</span>
                      </td>
                      <td className="py-1.5 px-1 text-center font-bold font-mono" style={{color:sgc.text,fontSize:'10px'}}>{s.gpa.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{background:'#1a3a5c'}}>
                  <td colSpan={4} className="py-2 px-2 bangla text-white font-bold text-right" style={{fontSize:'9px'}}>মোট</td>
                  <td className="py-2 px-1 text-center font-bold font-mono text-gold-300" style={{fontSize:'11px'}}>{result.totalMarks}</td>
                  <td className="py-2 px-1 text-center">
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                      style={{background:gc.bg,color:gc.text}}>{result.cgpaGrade}</span>
                  </td>
                  <td className="py-2 px-1 text-center font-bold font-mono text-gold-300" style={{fontSize:'11px'}}>{result.cgpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Result banner */}
          <div className="mx-3 mb-3 rounded-xl overflow-hidden">
            <div style={{background:result.passed?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)'}}
              className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{background:result.passed?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)'}}>
                {result.passed
                  ? <Award size={20} color="#34d399"/>
                  : <AlertCircle size={20} color="#f87171"/>}
              </div>
              <div className="flex-1">
                <p className="bangla font-bold text-white text-sm">{result.passed?'উত্তীর্ণ ✓':'অনুত্তীর্ণ ✗'}</p>
                <p className="bangla text-[10px] opacity-70 text-white">{result.passed?'অভিনন্দন!':'পুনরায় চেষ্টা করুন।'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold font-mono" style={{color:result.passed?'#34d399':'#f87171'}}>{result.cgpa.toFixed(2)}</p>
                <p className="text-[9px] text-white/60 bangla">সিজিপিএ</p>
              </div>
            </div>
          </div>

          {/* Grade scale */}
          <div className="mx-3 mb-3 p-2.5 rounded-xl" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
            <p className="text-[9px] text-slate-400 bangla mb-1.5 font-semibold">গ্রেড স্কেল</p>
            <div className="flex flex-wrap gap-1">
              {[['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']].map(([g,p])=>{
                const c=GRADE_COLORS[g]
                return <span key={g} className="text-[8px] px-1.5 py-0.5 rounded font-semibold font-mono"
                  style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`}}>{g}={p}</span>
              })}
            </div>
          </div>

          {/* Signature */}
          <div className="mx-3 mb-4 grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="h-8 border-b border-dashed border-slate-300 mb-1"/>
              <p className="bangla text-[9px] text-slate-400">শিক্ষার্থীর স্বাক্ষর</p>
            </div>
            <div className="text-center">
              <div className="h-8 border-b border-dashed border-slate-300 mb-1"/>
              <p className="bangla text-[9px] text-slate-400">অধ্যক্ষের স্বাক্ষর ও সীলমোহর</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 text-center" style={{background:'#1a3a5c'}}>
            <p className="text-[9px] text-blue-300 bangla">এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display:none !important; }
          body { background:white !important; margin:0; padding:0; }
          .marksheet {
            box-shadow:none !important; border-radius:0 !important;
            max-width:100% !important; width:100% !important;
            margin:0 !important; padding:0 !important;
          }
          @page { size:A4 portrait; margin:8mm; }
          html,body { height:auto; }
        }
      `}</style>
    </>
  )
}

function AlertCircle({size, color}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
