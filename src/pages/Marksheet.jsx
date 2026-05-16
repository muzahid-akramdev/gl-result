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
      const el = marksheetRef.current
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `marksheet_${student.name}_${student.roll}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      }
      await window.html2pdf().set(opt).from(el).save()
    } catch (e) {
      window.print()
    }
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
          body, html {
            background: white !important;
            margin: 0 !important; padding: 0 !important;
            height: auto !important; overflow: visible !important;
          }
          .print-outer { padding: 0 !important; margin: 0 !important; background: white !important; }
          .marksheet-wrap {
            box-shadow: none !important; border-radius: 0 !important;
            max-width: 100% !important; width: 100% !important; margin: 0 !important;
          }
          /* Shrink every section for A4 single page */
          .ms-head { padding: 4px 10px 3px !important; }
          .ms-logo { width: 30px !important; height: 30px !important; margin-bottom: 2px !important; }
          .ms-logo svg { width: 16px !important; height: 16px !important; }
          .ms-school-name { font-size: 12px !important; }
          .ms-school-sub { font-size: 7.5px !important; margin-top: 1px !important; }
          .ms-band { padding: 2px 10px !important; margin-top: 3px !important; }
          .ms-band-title { font-size: 10px !important; }
          .ms-band-sub { font-size: 8px !important; margin-top: 0 !important; }
          .ms-info { padding: 4px 10px !important; }
          .ms-info-grid { gap: 3px !important; }
          .ms-info-name { padding: 3px 8px !important; border-radius: 4px !important; }
          .ms-info-name-label { font-size: 7px !important; }
          .ms-info-name-val { font-size: 11px !important; margin-top: 0 !important; }
          .ms-info-cell { padding: 3px 6px !important; border-radius: 4px !important; }
          .ms-info-label { font-size: 7px !important; }
          .ms-info-val { font-size: 10px !important; margin-top: 0 !important; }
          .ms-table-wrap { padding: 3px 8px !important; }
          .ms-table th { padding: 3px 3px !important; font-size: 8px !important; }
          .ms-table td { padding: 1.5px 3px !important; font-size: 8px !important; line-height: 1.15 !important; }
          .ms-tfoot td { padding: 3px 3px !important; font-size: 9px !important; }
          .ms-banner { margin: 3px 8px !important; border-radius: 6px !important; }
          .ms-banner-inner { padding: 5px 10px !important; gap: 8px !important; }
          .ms-banner-icon { width: 28px !important; height: 28px !important; border-radius: 6px !important; }
          .ms-banner-title { font-size: 11px !important; }
          .ms-banner-sub { font-size: 8px !important; margin-top: 0 !important; }
          .ms-cgpa-big { font-size: 16px !important; }
          .ms-cgpa-lbl { font-size: 7px !important; }
          .ms-bottom { margin: 3px 8px !important; gap: 5px !important; }
          .ms-bottom-card { padding: 4px 6px !important; border-radius: 5px !important; }
          .ms-bottom-title { font-size: 7px !important; margin-bottom: 2px !important; }
          .ms-grade-badge { font-size: 7.5px !important; padding: 1px 3px !important; }
          .ms-summary-kv span { font-size: 8px !important; }
          .ms-sig { margin: 3px 8px !important; gap: 10px !important; }
          .ms-sig-line { height: 16px !important; }
          .ms-sig-lbl { font-size: 7px !important; }
          .ms-footer { padding: 3px 8px !important; }
          .ms-footer p { font-size: 7.5px !important; }

          @page { size: A4 portrait; margin: 5mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print sticky top-0 z-30 glass-dark px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-xl flex items-center justify-center">
          <ArrowLeft size={18}/>
        </button>
        <span className="flex-1 text-sm font-semibold text-white bangla truncate">{student.name}</span>
        <button onClick={() => navigate(`/edit/${id}`)} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-blue-400" title="সম্পাদনা">
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

      {/* Marksheet body */}
      <div className="print-outer p-3 pb-8">
        <div ref={marksheetRef}
          className="marksheet-wrap mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/40 animate-scale-in"
          style={{ maxWidth: '680px', fontFamily: "'Kalpurush','SolaimanLipi',sans-serif" }}>

          {/* ── Header ── */}
          <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#1a3a5c 55%,#1e5a8e 100%)' }}>
            <div className="ms-head" style={{ padding: '14px 24px 8px', textAlign: 'center', position: 'relative' }}>
              <div className="ms-logo" style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0a500,#fbbf24)', boxShadow: '0 6px 20px rgba(240,165,0,0.4)' }}>
                <GraduationCap size={22} color="#0a1628"/>
              </div>
              <h1 className="ms-school-name bangla" style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>গোল্ডেন লাইফ পাবলিক স্কুল</h1>
              <p className="ms-school-sub bangla" style={{ fontSize: 10, color: '#bfdbfe', marginTop: 2 }}>পাইকরতলী, কাজিপুর, সিরাজগঞ্জ &nbsp;|&nbsp; ০১৭৩৩৬৯৬৪৭৭</p>
              <p className="ms-school-sub bangla" style={{ fontSize: 9, color: 'rgba(147,197,253,0.7)', marginTop: 1 }}>স্থাপিতঃ ২০১৫ &nbsp;|&nbsp; পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম</p>

              <div className="ms-band" style={{ marginTop: 8, marginLeft: -24, marginRight: -24, padding: '5px 24px', background: 'rgba(240,165,0,0.15)', borderTop: '1px solid rgba(240,165,0,0.4)', borderBottom: '1px solid rgba(240,165,0,0.4)' }}>
                <p className="ms-band-title bangla" style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>✦ প্রগতি পত্র / মার্কশীট ✦</p>
                {student.exam_type && <p className="ms-band-sub bangla" style={{ fontSize: 9, color: 'rgba(251,191,36,0.7)', marginTop: 1 }}>{student.exam_type} · {student.exam_year}</p>}
              </div>
            </div>
          </div>

          {/* ── Student info ── */}
          <div className="ms-info" style={{ padding: '8px 14px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <div className="ms-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
              <div className="ms-info-name" style={{ gridColumn: '1/-1', padding: '5px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <p className="ms-info-name-label" style={{ fontSize: 8, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>শিক্ষার্থীর নাম</p>
                <p className="ms-info-name-val bangla" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 1 }}>{student.name}</p>
              </div>
              {[
                { label: 'শ্রেণি', value: classLabel },
                { label: 'রোল নং', value: student.roll },
                { label: 'পরীক্ষার সাল', value: student.exam_year || '—' },
                { label: 'অবস্থান', value: result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ', color: result.passed ? '#15803d' : '#991b1b' },
              ].map(({ label, value, color }) => (
                <div key={label} className="ms-info-cell" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <p className="ms-info-label" style={{ fontSize: 8, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</p>
                  <p className="ms-info-val bangla" style={{ fontSize: 11, fontWeight: 700, color: color || '#1e293b', marginTop: 1 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Marks table ── */}
          <div className="ms-table-wrap" style={{ padding: '8px 12px' }}>
            <table className="ms-table" style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg,#1a3a5c,#1e5a8e)' }}>
                  {['#','বিষয়ের নাম','নৈব','লিখিত','মোট','গ্রেড','জিপিএ'].map((h,i) => (
                    <th key={h} className="bangla" style={{ padding: '6px 4px', color: '#fff', fontWeight: 700, fontSize: 9, textAlign: i===1?'left':'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((s, i) => {
                  const sgc = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
                  return (
                    <tr key={s.key} style={{ background: i%2===0?'#f1f5f9':'#fff' }}>
                      <td style={{ padding:'3px 4px', textAlign:'center', color:'#94a3b8', fontSize:8, fontFamily:'monospace' }}>{i+1}</td>
                      <td className="bangla" style={{ padding:'3px 4px', color:'#334155', fontSize:9.5, fontWeight:500 }}>
                        {s.label}
                        {s.isFourth && <span style={{ marginLeft:3, fontSize:7, padding:'1px 3px', borderRadius:3, background:'#f3e8ff', color:'#7e22ce' }}>৪র্থ</span>}
                      </td>
                      <td style={{ padding:'3px 4px', textAlign:'center', color:'#64748b', fontFamily:'monospace' }}>
                        {s.naib>0?s.naib:<span style={{color:'#cbd5e1'}}>—</span>}
                      </td>
                      <td style={{ padding:'3px 4px', textAlign:'center', color:'#64748b', fontFamily:'monospace' }}>{s.written}</td>
                      <td style={{ padding:'3px 4px', textAlign:'center', fontWeight:700, color:'#1e293b', fontFamily:'monospace', fontSize:10.5 }}>{s.total}</td>
                      <td style={{ padding:'3px 4px', textAlign:'center' }}>
                        <span className="ms-grade-badge" style={{ padding:'1px 5px', borderRadius:4, fontSize:8, fontWeight:700, background:sgc.bg, color:sgc.text, border:`1px solid ${sgc.border}` }}>{s.grade}</span>
                      </td>
                      <td style={{ padding:'3px 4px', textAlign:'center', fontWeight:700, fontFamily:'monospace', color:sgc.text, fontSize:9.5 }}>{s.gpa.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'linear-gradient(90deg,#1a3a5c,#1e5a8e)' }}>
                  <td colSpan={4} className="ms-tfoot bangla" style={{ padding:'5px 8px', textAlign:'right', color:'#fff', fontWeight:700, fontSize:9 }}>সর্বমোট নম্বর</td>
                  <td className="ms-tfoot" style={{ padding:'5px 4px', textAlign:'center', fontWeight:700, fontFamily:'monospace', color:'#fbbf24', fontSize:11 }}>{result.totalMarks}</td>
                  <td className="ms-tfoot" style={{ padding:'5px 4px', textAlign:'center' }}>
                    <span style={{ padding:'1px 5px', borderRadius:4, fontSize:8, fontWeight:700, background:gc.bg, color:gc.text, border:`1px solid ${gc.border}` }}>{result.cgpaGrade}</span>
                  </td>
                  <td className="ms-tfoot" style={{ padding:'5px 4px', textAlign:'center', fontWeight:700, fontFamily:'monospace', color:'#fbbf24', fontSize:11 }}>{result.cgpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Result banner ── */}
          <div className="ms-banner" style={{ margin:'6px 12px', borderRadius:10, overflow:'hidden', border:`1.5px solid ${result.passed?'#6ee7b7':'#fca5a5'}` }}>
            <div className="ms-banner-inner" style={{ background: result.passed?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)', padding:'8px 14px', display:'flex', alignItems:'center', gap:12 }}>
              <div className="ms-banner-icon" style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: result.passed?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)' }}>
                {result.passed?<Award size={20} color="#34d399"/>:<AlertCircle size={20} color="#f87171"/>}
              </div>
              <div style={{ flex:1 }}>
                <p className="ms-banner-title bangla" style={{ fontWeight:700, color:'#fff', fontSize:13 }}>
                  {result.passed?'✓ উত্তীর্ণ':'✗ অনুত্তীর্ণ'}
                </p>
                <p className="ms-banner-sub bangla" style={{ fontSize:9, marginTop:1, color:'rgba(255,255,255,0.65)' }}>
                  {result.passed?'অভিনন্দন! চমৎকার ফলাফল।':'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'}
                </p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p className="ms-cgpa-big" style={{ fontSize:22, fontWeight:700, fontFamily:'monospace', color: result.passed?'#34d399':'#f87171' }}>{result.cgpa.toFixed(2)}</p>
                <p className="ms-cgpa-lbl bangla" style={{ fontSize:8, color:'rgba(255,255,255,0.5)' }}>সিজিপিএ</p>
              </div>
            </div>
          </div>

          {/* ── Grade scale + Summary ── */}
          <div className="ms-bottom" style={{ margin:'6px 12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div className="ms-bottom-card" style={{ padding:'6px 8px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
              <p className="ms-bottom-title bangla" style={{ fontSize:8, fontWeight:700, marginBottom:4, color:'#64748b', textTransform:'uppercase' }}>গ্রেড স্কেল</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                {[['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']].map(([g,p]) => {
                  const c = GRADE_COLORS[g]
                  return <span key={g} className="ms-grade-badge" style={{ fontSize:8, padding:'1px 5px', borderRadius:3, fontWeight:700, fontFamily:'monospace', background:c.bg, color:c.text, border:`1px solid ${c.border}` }}>{g}={p}</span>
                })}
              </div>
            </div>
            <div className="ms-bottom-card" style={{ padding:'6px 8px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
              <p className="ms-bottom-title bangla" style={{ fontSize:8, fontWeight:700, marginBottom:4, color:'#64748b', textTransform:'uppercase' }}>সারসংক্ষেপ</p>
              {[['মোট বিষয়',result.subjects.length],['মোট নম্বর',result.totalMarks],['সিজিপিএ',result.cgpa.toFixed(2)],['গ্রেড',result.cgpaGrade]].map(([k,v]) => (
                <div key={k} className="ms-summary-kv" style={{ display:'flex', justifyContent:'space-between', marginBottom:1 }}>
                  <span className="bangla" style={{ fontSize:8.5, color:'#64748b' }}>{k}</span>
                  <span style={{ fontSize:8.5, fontWeight:700, fontFamily:'monospace', color:'#1e293b' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Signatures ── */}
          <div className="ms-sig" style={{ margin:'6px 12px 8px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
            {['শিক্ষার্থীর স্বাক্ষর','অভিভাবকের স্বাক্ষর','অধ্যক্ষের সীলমোহর'].map(label => (
              <div key={label} style={{ textAlign:'center' }}>
                <div className="ms-sig-line" style={{ height:22, borderBottom:'1px dashed #94a3b8', marginBottom:3 }}/>
                <p className="ms-sig-lbl bangla" style={{ fontSize:8, color:'#94a3b8' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="ms-footer" style={{ padding:'5px 12px', textAlign:'center', background:'linear-gradient(90deg,#0a1628,#1a3a5c)' }}>
            <p className="bangla" style={{ fontSize:8.5, color:'#93c5fd' }}>এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ</p>
          </div>
        </div>
      </div>
    </>
  )
}
