import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, GRADE_COLORS, CLASS_GROUPS } from '../lib/grades'
import { ArrowLeft, Printer, Share2, GraduationCap, Award, AlertCircle, Trash2, Download, Pencil } from 'lucide-react'

export default function Marksheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const marksheetRef = useRef()

  useEffect(() => {
    supabase.from('students').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setStudent(data); setResult(calcResult(data)) }
      setLoading(false)
    })
  }, [id])

  async function handleDelete() {
    if (!confirm('এই মার্কশিট মুছে ফেলবেন?')) return
    await supabase.from('students').delete().eq('id', id)
    navigate('/students')
  }

  async function handleShare() {
    if (navigator.share) await navigator.share({
      title: `${student.name} - মার্কশিট`,
      text: `রোল: ${student.roll} | CGPA: ${result.cgpa.toFixed(2)} | ${result.passed ? 'Pass' : 'Fail'}`,
    })
  }

  async function handlePDF() {
    setPdfLoading(true)
    try {
      if (!window.html2pdf) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        document.head.appendChild(script)
        await new Promise(r => { script.onload = r })
      }
      await window.html2pdf().set({
        margin: 0,
        filename: `marksheet_${student.name}_${student.roll}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(marksheetRef.current).save()
    } catch { window.print() }
    setPdfLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"/>
    </div>
  )
  if (!student || !result) return (
    <div className="text-center py-20 text-slate-500 bangla">তথ্য পাওয়া যায়নি</div>
  )

  const gc = GRADE_COLORS[result.cgpaGrade] || GRADE_COLORS['F']
  const classLabel = CLASS_GROUPS[student.class_num]?.label || student.class_num

  return (
    <>
      <style>{`
        @import url('https://fonts.maateen.me/kalpurush/font.css');
        .bangla, .bangla * { font-family: 'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif !important; }
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
          .print-outer { padding: 0 !important; margin: 0 !important; background: white !important; display: flex !important; justify-content: center !important; }
          .marksheet-wrap { transform: scale(0.92) !important; transform-origin: top center !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
          @page { size: A4 portrait; margin: 4mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print sticky top-0 z-30 glass-dark px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-xl flex items-center justify-center"><ArrowLeft size={18}/></button>
        <span className="flex-1 text-sm font-semibold text-white bangla truncate">{student.name}</span>
        <button onClick={() => navigate(`/edit/${id}`)} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-blue-400"><Pencil size={15}/></button>
        <button onClick={handleShare} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400"><Share2 size={16}/></button>
        <button onClick={handleDelete} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-rose-400"><Trash2 size={15}/></button>
        <button onClick={handlePDF} disabled={pdfLoading} className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm bangla disabled:opacity-60">
          <Download size={15}/>{pdfLoading ? '...' : 'PDF'}
        </button>
        <button onClick={() => window.print()} className="glass flex items-center gap-1.5 py-2 px-3 text-sm bangla text-slate-300 rounded-xl">
          <Printer size={15}/>প্রিন্ট
        </button>
      </div>

      <div className="print-outer p-3 pb-8">
        <div ref={marksheetRef} className="marksheet-wrap mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
          style={{ width: 680, fontFamily: "'Kalpurush','SolaimanLipi',sans-serif" }}>

          {/* ══ HEADER — light warm gold/cream theme ══ */}
          <div style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', position:'relative', overflow:'hidden' }}>
            {/* decorative circles */}
            <div style={{ position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,200,80,0.08)' }}/>
            <div style={{ position:'absolute',bottom:-20,left:-20,width:80,height:80,borderRadius:'50%',background:'rgba(255,200,80,0.05)' }}/>
            <div style={{ position:'absolute',top:'50%',left:'10%',width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.03)' }}/>

            <div style={{ padding:'22px 28px 0', textAlign:'center', position:'relative' }}>
              {/* Logo */}
              <div style={{ width:62,height:62,borderRadius:18,margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#f59e0b,#fcd34d)',boxShadow:'0 10px 30px rgba(245,158,11,0.5)' }}>
                <GraduationCap size={30} color="#1a1a2e"/>
              </div>
              <h1 className="bangla" style={{ fontSize:20,fontWeight:700,color:'#fef3c7',lineHeight:1.2,letterSpacing:'0.02em' }}>গোল্ডেন লাইফ পাবলিক স্কুল</h1>
              <p className="bangla" style={{ fontSize:12,color:'#fde68a',marginTop:4,opacity:0.85 }}>পাইকরতলী, কাজিপুর, সিরাজগঞ্জ &nbsp;|&nbsp; ০১৭৩৩৬৯৬৪৭৭</p>
              <p className="bangla" style={{ fontSize:11,color:'#fde68a',marginTop:2,opacity:0.6 }}>স্থাপিতঃ ২০১৫ &nbsp;|&nbsp; পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম</p>

              {/* Title band */}
              <div style={{ marginTop:14,marginLeft:-28,marginRight:-28,padding:'8px 28px',background:'rgba(245,158,11,0.2)',borderTop:'1px solid rgba(245,158,11,0.5)',borderBottom:'1px solid rgba(245,158,11,0.5)' }}>
                <p className="bangla" style={{ fontSize:14,fontWeight:700,color:'#fcd34d',letterSpacing:'0.04em' }}>✦ প্রগতি পত্র / মার্কশীট ✦</p>
                {student.exam_type && <p className="bangla" style={{ fontSize:11,color:'rgba(252,211,77,0.75)',marginTop:3 }}>{student.exam_type} · {student.exam_year}</p>}
              </div>
            </div>
          </div>

          {/* ══ STUDENT INFO ══ */}
          <div style={{ padding:'12px 18px',background:'#f0f4f8',borderBottom:'2px solid #cbd5e1' }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8 }}>
              <div style={{ gridColumn:'1/-1',padding:'8px 14px',background:'#fff',border:'1px solid #cbd5e1',borderRadius:12,borderLeft:'4px solid #f59e0b' }}>
                <p style={{ fontSize:9,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em' }}>শিক্ষার্থীর নাম</p>
                <p className="bangla" style={{ fontSize:17,fontWeight:700,color:'#1e293b',marginTop:2 }}>{student.name}</p>
              </div>
              {[
                { label:'শ্রেণি',        value: classLabel },
                { label:'রোল নং',        value: student.roll },
                { label:'পরীক্ষার সাল', value: student.exam_year||'—' },
                { label:'অবস্থান',       value: result.passed?'উত্তীর্ণ':'অনুত্তীর্ণ', color: result.passed?'#15803d':'#991b1b', bg: result.passed?'#f0fdf4':'#fef2f2' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ padding:'7px 12px',background: bg||'#fff',border:'1px solid #cbd5e1',borderRadius:10 }}>
                  <p style={{ fontSize:9,fontWeight:600,color:'#94a3b8',textTransform:'uppercase' }}>{label}</p>
                  <p className="bangla" style={{ fontSize:13,fontWeight:700,color:color||'#1e293b',marginTop:2 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══ MARKS TABLE ══ */}
          <div style={{ padding:'12px 16px' }}>
            <table style={{ width:'100%',fontSize:12,borderCollapse:'collapse',borderRadius:8,overflow:'hidden' }}>
              <thead>
                <tr style={{ background:'linear-gradient(90deg,#0f3460,#1a5276)' }}>
                  {['#','বিষয়ের নাম','নৈব','লিখিত','মোট','গ্রেড','জিপিএ'].map((h,i) => (
                    <th key={h} className="bangla" style={{ padding:'9px 6px',color:'#fef3c7',fontWeight:700,fontSize:11,textAlign:i===1?'left':'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((s, i) => {
                  const sgc = GRADE_COLORS[s.grade]||GRADE_COLORS['F']
                  return (
                    <tr key={s.key} style={{ background:i%2===0?'#f8fafc':'#fff' }}>
                      <td style={{ padding:'5px 6px',textAlign:'center',color:'#94a3b8',fontSize:10,fontFamily:'monospace' }}>{i+1}</td>
                      <td className="bangla" style={{ padding:'5px 6px',color:'#1e293b',fontSize:12,fontWeight:500 }}>
                        {s.label}
                        {s.isFourth && <span style={{ marginLeft:4,fontSize:9,padding:'1px 5px',borderRadius:4,background:'#f3e8ff',color:'#7e22ce' }}>৪র্থ</span>}
                      </td>
                      <td style={{ padding:'5px 6px',textAlign:'center',color:'#475569',fontFamily:'monospace',fontSize:12 }}>
                        {s.naib>0?s.naib:<span style={{ color:'#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding:'5px 6px',textAlign:'center',color:'#475569',fontFamily:'monospace',fontSize:12 }}>{s.written}</td>
                      <td style={{ padding:'5px 6px',textAlign:'center',fontWeight:700,color:'#0f172a',fontFamily:'monospace',fontSize:13 }}>{s.total}</td>
                      <td style={{ padding:'5px 6px',textAlign:'center' }}>
                        <span style={{ padding:'2px 8px',borderRadius:6,fontSize:10,fontWeight:700,background:sgc.bg,color:sgc.text,border:`1px solid ${sgc.border}` }}>{s.grade}</span>
                      </td>
                      <td style={{ padding:'5px 6px',textAlign:'center',fontWeight:700,fontFamily:'monospace',color:sgc.text,fontSize:12 }}>{s.gpa.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:'linear-gradient(90deg,#0f3460,#1a5276)' }}>
                  <td colSpan={4} className="bangla" style={{ padding:'8px 12px',textAlign:'right',color:'#fef3c7',fontWeight:700,fontSize:11 }}>সর্বমোট নম্বর</td>
                  <td style={{ padding:'8px 6px',textAlign:'center',fontWeight:700,fontFamily:'monospace',color:'#fcd34d',fontSize:14 }}>{result.totalMarks}</td>
                  <td style={{ padding:'8px 6px',textAlign:'center' }}>
                    <span style={{ padding:'2px 8px',borderRadius:6,fontSize:10,fontWeight:700,background:gc.bg,color:gc.text,border:`1px solid ${gc.border}` }}>{result.cgpaGrade}</span>
                  </td>
                  <td style={{ padding:'8px 6px',textAlign:'center',fontWeight:700,fontFamily:'monospace',color:'#fcd34d',fontSize:14 }}>{result.cgpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ══ RESULT BANNER ══ */}
          <div style={{ margin:'4px 16px 8px',borderRadius:14,overflow:'hidden',border:`2px solid ${result.passed?'#6ee7b7':'#fca5a5'}` }}>
            <div style={{ background:result.passed?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)',padding:'12px 16px',display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:48,height:48,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:result.passed?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)' }}>
                {result.passed?<Award size={24} color="#34d399"/>:<AlertCircle size={24} color="#f87171"/>}
              </div>
              <div style={{ flex:1 }}>
                <p className="bangla" style={{ fontWeight:700,color:'#fff',fontSize:17,margin:0 }}>{result.passed?'✓ উত্তীর্ণ':'✗ অনুত্তীর্ণ'}</p>
                <p className="bangla" style={{ fontSize:11,marginTop:3,color:'rgba(255,255,255,0.65)',margin:'3px 0 0' }}>
                  {result.passed?'অভিনন্দন! চমৎকার ফলাফল।':'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'}
                </p>
              </div>
              <div style={{ textAlign:'right',flexShrink:0 }}>
                <p style={{ fontSize:30,fontWeight:700,fontFamily:'monospace',color:result.passed?'#34d399':'#f87171',margin:0 }}>{result.cgpa.toFixed(2)}</p>
                <p className="bangla" style={{ fontSize:10,color:'rgba(255,255,255,0.5)',margin:0 }}>সিজিপিএ</p>
              </div>
            </div>
          </div>

          {/* ══ GRADE SCALE + SUMMARY ══ */}
          <div style={{ margin:'0 16px 8px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <div style={{ padding:'10px 12px',borderRadius:12,background:'#f8fafc',border:'1px solid #cbd5e1' }}>
              <p className="bangla" style={{ fontSize:10,fontWeight:700,marginBottom:8,color:'#64748b',textTransform:'uppercase' }}>গ্রেড স্কেল</p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {[['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']].map(([g,p]) => {
                  const c = GRADE_COLORS[g]
                  return <span key={g} style={{ fontSize:10,padding:'2px 7px',borderRadius:5,fontWeight:700,fontFamily:'monospace',background:c.bg,color:c.text,border:`1px solid ${c.border}` }}>{g}={p}</span>
                })}
              </div>
            </div>
            <div style={{ padding:'10px 12px',borderRadius:12,background:'#f8fafc',border:'1px solid #cbd5e1' }}>
              <p className="bangla" style={{ fontSize:10,fontWeight:700,marginBottom:8,color:'#64748b',textTransform:'uppercase' }}>সারসংক্ষেপ</p>
              {[['মোট বিষয়',result.subjects.length],['মোট নম্বর',result.totalMarks],['সিজিপিএ',result.cgpa.toFixed(2)],['গ্রেড',result.cgpaGrade]].map(([k,v]) => (
                <div key={k} style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
                  <span className="bangla" style={{ fontSize:11,color:'#64748b' }}>{k}</span>
                  <span style={{ fontSize:11,fontWeight:700,fontFamily:'monospace',color:'#1e293b' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ SIGNATURES ══ */}
          <div style={{ margin:'0 16px 12px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:24 }}>
            {['শিক্ষার্থীর স্বাক্ষর','অভিভাবকের স্বাক্ষর','অধ্যক্ষের সীলমোহর'].map(label => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ height:32,borderBottom:'1px dashed #94a3b8',marginBottom:5 }}/>
                <p className="bangla" style={{ fontSize:10,color:'#94a3b8' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ══ FOOTER ══ */}
          <div style={{ padding:'8px 16px',textAlign:'center',background:'linear-gradient(90deg,#1a1a2e,#0f3460)' }}>
            <p className="bangla" style={{ fontSize:10,color:'#fde68a',opacity:0.8 }}>এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
          </div>
        </div>
      </div>
    </>
  )
}
