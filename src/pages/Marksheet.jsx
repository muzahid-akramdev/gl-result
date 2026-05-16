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
        margin: [6, 6, 6, 6],
        filename: `marksheet_${student.name}_${student.roll}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      }).from(marksheetRef.current).save()
    } catch (e) { window.print() }
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
        .bangla, .bangla * {
          font-family: 'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif !important;
        }

        @media print {
          .no-print { display: none !important; }
          body, html {
            background: white !important;
            margin: 0 !important; padding: 0 !important;
            height: auto !important; overflow: visible !important;
          }
          .print-outer {
            padding: 0 !important; margin: 0 !important; background: white !important;
          }
          .marksheet-wrap {
            box-shadow: none !important; border-radius: 0 !important;
            max-width: 100% !important; width: 100% !important; margin: 0 !important;
          }
          /* Only tighten spacing enough to fit one page — keep design intact */
          .ms-header-pad { padding: 10px 20px 6px !important; }
          .ms-logo-size { width: 44px !important; height: 44px !important; margin-bottom: 6px !important; }
          .ms-band-pad  { padding: 4px 20px !important; margin-top: 6px !important; }
          .ms-info-pad  { padding: 6px 14px !important; }
          .ms-info-gap  { gap: 4px !important; }
          .ms-table-pad { padding: 4px 10px !important; }
          .ms-row-pad td { padding: 2.5px 4px !important; }
          .ms-banner-pad { margin: 4px 10px !important; }
          .ms-banner-inner { padding: 7px 12px !important; }
          .ms-bottom-pad { margin: 4px 10px !important; gap: 6px !important; }
          .ms-card-pad   { padding: 6px 8px !important; }
          .ms-sig-pad    { margin: 4px 10px 6px !important; }
          .ms-footer-pad { padding: 4px 10px !important; }
          @page { size: A4 portrait; margin: 6mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print sticky top-0 z-30 glass-dark px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-xl flex items-center justify-center">
          <ArrowLeft size={18}/>
        </button>
        <span className="flex-1 text-sm font-semibold text-white bangla truncate">{student.name}</span>
        <button onClick={() => navigate(`/edit/${id}`)} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-blue-400">
          <Pencil size={15}/>
        </button>
        <button onClick={handleShare} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400">
          <Share2 size={16}/>
        </button>
        <button onClick={handleDelete} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-rose-400">
          <Trash2 size={15}/>
        </button>
        <button onClick={handlePDF} disabled={pdfLoading}
          className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm bangla disabled:opacity-60">
          <Download size={15}/>{pdfLoading ? '...' : 'PDF'}
        </button>
        <button onClick={() => window.print()}
          className="glass flex items-center gap-1.5 py-2 px-3 text-sm bangla text-slate-300 rounded-xl">
          <Printer size={15}/>প্রিন্ট
        </button>
      </div>

      <div className="print-outer p-3 pb-8">
        <div ref={marksheetRef}
          className="marksheet-wrap mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
          style={{ maxWidth: 680, fontFamily: "'Kalpurush','SolaimanLipi',sans-serif" }}>

          {/* ══ HEADER ══ */}
          <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#1a3a5c 55%,#1e5a8e 100%)' }}>
            <div className="ms-header-pad" style={{ padding: '20px 28px 12px', textAlign: 'center', position: 'relative' }}>
              {/* decorative */}
              <div style={{ position:'absolute', top:-16, right:-16, width:80, height:80, borderRadius:'50%', background:'rgba(240,165,0,0.07)', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:-8, left:-8, width:48, height:48, borderRadius:'50%', background:'rgba(240,165,0,0.05)', pointerEvents:'none' }}/>

              <div className="ms-logo-size" style={{ width:56, height:56, borderRadius:16, margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#f0a500,#fbbf24)', boxShadow:'0 8px 24px rgba(240,165,0,0.45)' }}>
                <GraduationCap size={26} color="#0a1628"/>
              </div>

              <h1 className="bangla" style={{ fontSize:18, fontWeight:700, color:'#fff', lineHeight:1.2, letterSpacing:'0.02em' }}>
                গোল্ডেন লাইফ পাবলিক স্কুল
              </h1>
              <p className="bangla" style={{ fontSize:11, color:'#bfdbfe', marginTop:3 }}>
                পাইকরতলী, কাজিপুর, সিরাজগঞ্জ &nbsp;|&nbsp; ০১৭৩৩৬৯৬৪৭৭
              </p>
              <p className="bangla" style={{ fontSize:10, color:'rgba(147,197,253,0.7)', marginTop:2 }}>
                স্থাপিতঃ ২০১৫ &nbsp;|&nbsp; পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম
              </p>

              <div className="ms-band-pad" style={{ marginTop:10, marginLeft:-28, marginRight:-28, padding:'6px 28px', background:'rgba(240,165,0,0.15)', borderTop:'1px solid rgba(240,165,0,0.4)', borderBottom:'1px solid rgba(240,165,0,0.4)' }}>
                <p className="bangla" style={{ fontSize:13, fontWeight:700, color:'#fbbf24', letterSpacing:'0.03em' }}>✦ প্রগতি পত্র / মার্কশীট ✦</p>
                {student.exam_type && (
                  <p className="bangla" style={{ fontSize:10, color:'rgba(251,191,36,0.72)', marginTop:2 }}>{student.exam_type} · {student.exam_year}</p>
                )}
              </div>
            </div>
          </div>

          {/* ══ STUDENT INFO ══ */}
          <div className="ms-info-pad" style={{ padding:'10px 16px', background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
            <div className="ms-info-gap" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6 }}>
              {/* Name full width */}
              <div style={{ gridColumn:'1/-1', padding:'7px 12px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:10 }}>
                <p style={{ fontSize:9, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>শিক্ষার্থীর নাম</p>
                <p className="bangla" style={{ fontSize:15, fontWeight:700, color:'#1e293b', marginTop:2 }}>{student.name}</p>
              </div>
              {[
                { label:'শ্রেণি',        value: classLabel },
                { label:'রোল নং',        value: student.roll },
                { label:'পরীক্ষার সাল', value: student.exam_year || '—' },
                { label:'অবস্থান',       value: result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ', color: result.passed ? '#15803d' : '#991b1b' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding:'6px 10px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:10 }}>
                  <p style={{ fontSize:9, fontWeight:600, color:'#94a3b8', textTransform:'uppercase' }}>{label}</p>
                  <p className="bangla" style={{ fontSize:12, fontWeight:700, color: color||'#1e293b', marginTop:2 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══ MARKS TABLE ══ */}
          <div className="ms-table-pad" style={{ padding:'10px 14px' }}>
            <table style={{ width:'100%', fontSize:11, borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'linear-gradient(90deg,#1a3a5c,#1e5a8e)' }}>
                  {['#','বিষয়ের নাম','নৈব','লিখিত','মোট','গ্রেড','জিপিএ'].map((h,i) => (
                    <th key={h} className="bangla" style={{ padding:'7px 5px', color:'#fff', fontWeight:700, fontSize:10, textAlign: i===1?'left':'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((s, i) => {
                  const sgc = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
                  return (
                    <tr className="ms-row-pad" key={s.key} style={{ background: i%2===0 ? '#f1f5f9' : '#fff' }}>
                      <td style={{ padding:'4px 5px', textAlign:'center', color:'#94a3b8', fontSize:9, fontFamily:'monospace' }}>{i+1}</td>
                      <td className="bangla" style={{ padding:'4px 5px', color:'#334155', fontSize:10.5, fontWeight:500 }}>
                        {s.label}
                        {s.isFourth && <span style={{ marginLeft:4, fontSize:8, padding:'1px 4px', borderRadius:3, background:'#f3e8ff', color:'#7e22ce' }}>৪র্থ</span>}
                      </td>
                      <td style={{ padding:'4px 5px', textAlign:'center', color:'#64748b', fontFamily:'monospace' }}>
                        {s.naib > 0 ? s.naib : <span style={{ color:'#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding:'4px 5px', textAlign:'center', color:'#64748b', fontFamily:'monospace' }}>{s.written}</td>
                      <td style={{ padding:'4px 5px', textAlign:'center', fontWeight:700, color:'#1e293b', fontFamily:'monospace', fontSize:12 }}>{s.total}</td>
                      <td style={{ padding:'4px 5px', textAlign:'center' }}>
                        <span style={{ padding:'2px 6px', borderRadius:5, fontSize:9, fontWeight:700, background:sgc.bg, color:sgc.text, border:`1px solid ${sgc.border}` }}>{s.grade}</span>
                      </td>
                      <td style={{ padding:'4px 5px', textAlign:'center', fontWeight:700, fontFamily:'monospace', color:sgc.text, fontSize:11 }}>{s.gpa.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:'linear-gradient(90deg,#1a3a5c,#1e5a8e)' }}>
                  <td colSpan={4} className="bangla" style={{ padding:'7px 10px', textAlign:'right', color:'#fff', fontWeight:700, fontSize:10 }}>সর্বমোট নম্বর</td>
                  <td style={{ padding:'7px 5px', textAlign:'center', fontWeight:700, fontFamily:'monospace', color:'#fbbf24', fontSize:13 }}>{result.totalMarks}</td>
                  <td style={{ padding:'7px 5px', textAlign:'center' }}>
                    <span style={{ padding:'2px 6px', borderRadius:5, fontSize:9, fontWeight:700, background:gc.bg, color:gc.text, border:`1px solid ${gc.border}` }}>{result.cgpaGrade}</span>
                  </td>
                  <td style={{ padding:'7px 5px', textAlign:'center', fontWeight:700, fontFamily:'monospace', color:'#fbbf24', fontSize:13 }}>{result.cgpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ══ RESULT BANNER ══ */}
          <div className="ms-banner-pad" style={{ margin:'8px 14px', borderRadius:12, overflow:'hidden', border:`1.5px solid ${result.passed?'#6ee7b7':'#fca5a5'}` }}>
            <div className="ms-banner-inner" style={{ background: result.passed?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)', padding:'10px 14px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: result.passed?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)' }}>
                {result.passed ? <Award size={22} color="#34d399"/> : <AlertCircle size={22} color="#f87171"/>}
              </div>
              <div style={{ flex:1 }}>
                <p className="bangla" style={{ fontWeight:700, color:'#fff', fontSize:15 }}>
                  {result.passed ? '✓ উত্তীর্ণ' : '✗ অনুত্তীর্ণ'}
                </p>
                <p className="bangla" style={{ fontSize:10, marginTop:2, color:'rgba(255,255,255,0.65)' }}>
                  {result.passed ? 'অভিনন্দন! চমৎকার ফলাফল।' : 'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'}
                </p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:26, fontWeight:700, fontFamily:'monospace', color: result.passed?'#34d399':'#f87171' }}>{result.cgpa.toFixed(2)}</p>
                <p className="bangla" style={{ fontSize:9, color:'rgba(255,255,255,0.5)' }}>সিজিপিএ</p>
              </div>
            </div>
          </div>

          {/* ══ GRADE SCALE + SUMMARY ══ */}
          <div className="ms-bottom-pad" style={{ margin:'8px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="ms-card-pad" style={{ padding:'8px 10px', borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
              <p className="bangla" style={{ fontSize:9, fontWeight:700, marginBottom:6, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.04em' }}>গ্রেড স্কেল</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {[['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']].map(([g,p]) => {
                  const c = GRADE_COLORS[g]
                  return <span key={g} style={{ fontSize:9, padding:'2px 6px', borderRadius:4, fontWeight:700, fontFamily:'monospace', background:c.bg, color:c.text, border:`1px solid ${c.border}` }}>{g}={p}</span>
                })}
              </div>
            </div>
            <div className="ms-card-pad" style={{ padding:'8px 10px', borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
              <p className="bangla" style={{ fontSize:9, fontWeight:700, marginBottom:6, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.04em' }}>সারসংক্ষেপ</p>
              {[['মোট বিষয়',result.subjects.length],['মোট নম্বর',result.totalMarks],['সিজিপিএ',result.cgpa.toFixed(2)],['গ্রেড',result.cgpaGrade]].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                  <span className="bangla" style={{ fontSize:10, color:'#64748b' }}>{k}</span>
                  <span style={{ fontSize:10, fontWeight:700, fontFamily:'monospace', color:'#1e293b' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ SIGNATURES ══ */}
          <div className="ms-sig-pad" style={{ margin:'8px 14px 10px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
            {['শিক্ষার্থীর স্বাক্ষর','অভিভাবকের স্বাক্ষর','অধ্যক্ষের সীলমোহর'].map(label => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ height:28, borderBottom:'1px dashed #94a3b8', marginBottom:4 }}/>
                <p className="bangla" style={{ fontSize:9, color:'#94a3b8' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ══ FOOTER ══ */}
          <div className="ms-footer-pad" style={{ padding:'7px 14px', textAlign:'center', background:'linear-gradient(90deg,#0a1628,#1a3a5c)' }}>
            <p className="bangla" style={{ fontSize:9.5, color:'#93c5fd' }}>এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
          </div>

        </div>
      </div>
    </>
  )
}
