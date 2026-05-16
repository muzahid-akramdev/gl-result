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
      const { default: html2pdf } = await import('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
      const el = marksheetRef.current
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `marksheet_${student.name}_${student.roll}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      }
      await html2pdf().set(opt).from(el).save()
    } catch (e) {
      // fallback to print
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
      {/* Kalpurush font */}
      <style>{`
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        .bangla, .bangla * {
          font-family: 'Kalpurush', 'SolaimanLipi', 'Noto Sans Bengali', sans-serif !important;
        }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .marksheet-wrap {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-outer { padding: 0 !important; }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body { height: auto; overflow: visible; }
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
        <button onClick={handlePDF} disabled={pdfLoading} className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm bangla disabled:opacity-60">
          <Download size={15}/>{pdfLoading ? '...' : 'PDF'}
        </button>
        <button onClick={() => window.print()} className="glass flex items-center gap-1.5 py-2 px-3 text-sm bangla text-slate-300 rounded-xl">
          <Printer size={15}/>প্রিন্ট
        </button>
      </div>

      {/* Marksheet */}
      <div className="print-outer p-3 pb-8 print:p-0 print:pb-0">
        <div ref={marksheetRef} className="marksheet-wrap mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/40 animate-scale-in print:rounded-none print:shadow-none"
          style={{ maxWidth: '680px', fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}>

          {/* Header */}
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0a1628 0%,#1a3a5c 55%,#1e5a8e 100%)' }}>
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(240,165,0,0.08)' }}/>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full" style={{ background: 'rgba(240,165,0,0.05)' }}/>

            <div className="relative px-6 pt-5 pb-4 text-center">
              {/* Logo */}
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-xl"
                style={{ background: 'linear-gradient(135deg,#f0a500,#fbbf24)', boxShadow: '0 8px 24px rgba(240,165,0,0.4)' }}>
                <GraduationCap size={26} color="#0a1628"/>
              </div>
              <h1 className="bangla text-lg font-bold text-white leading-tight tracking-wide">গোল্ডেন লাইফ পাবলিক স্কুল</h1>
              <p className="bangla text-[11px] text-blue-200 mt-1">পাইকরতলী, কাজিপুর, সিরাজগঞ্জ &nbsp;|&nbsp; ০১৭৩৩৬৯৬৪৭৭</p>
              <p className="bangla text-[10px] text-blue-300/80 mt-0.5">স্থাপিতঃ ২০১৫ &nbsp;|&nbsp; পরিচালকঃ ডাঃ মোঃ আমিনুল ইসলাম</p>

              {/* Title band */}
              <div className="mt-3 mx-[-24px] px-6 py-2" style={{ background: 'rgba(240,165,0,0.15)', borderTop: '1px solid rgba(240,165,0,0.4)', borderBottom: '1px solid rgba(240,165,0,0.4)' }}>
                <p className="bangla text-sm font-bold tracking-widest" style={{ color: '#fbbf24', letterSpacing: '0.05em' }}>✦ প্রগতি পত্র / মার্কশীট ✦</p>
                {student.exam_type && (
                  <p className="bangla text-[10px] mt-0.5" style={{ color: 'rgba(251,191,36,0.75)' }}>{student.exam_type} · {student.exam_year}</p>
                )}
              </div>
            </div>
          </div>

          {/* Student info */}
          <div className="px-5 py-3" style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-4 px-3 py-2 rounded-xl" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>শিক্ষার্থীর নাম</p>
                <p className="bangla text-base font-bold mt-0.5" style={{ color: '#1e293b' }}>{student.name}</p>
              </div>
              {[
                { label: 'শ্রেণি', value: classLabel },
                { label: 'রোল নং', value: student.roll },
                { label: 'পরীক্ষার সাল', value: student.exam_year || '—' },
                { label: 'অবস্থান', value: result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ', color: result.passed ? '#15803d' : '#991b1b' },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-3 py-2 rounded-xl" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                  <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</p>
                  <p className="bangla text-sm font-bold mt-0.5" style={{ color: color || '#1e293b' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Marks Table */}
          <div className="px-4 py-3">
            <table className="w-full" style={{ fontSize: '10.5px', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg,#1a3a5c,#1e5a8e)' }}>
                  {['#', 'বিষয়ের নাম', 'নৈব', 'লিখিত', 'মোট', 'গ্রেড', 'জিপিএ'].map((h, i) => (
                    <th key={h} className={`py-2.5 px-1.5 bangla font-bold text-white ${i === 1 ? 'text-left' : 'text-center'}`}
                      style={{ fontSize: '9.5px', letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((s, i) => {
                  const sgc = GRADE_COLORS[s.grade] || GRADE_COLORS['F']
                  return (
                    <tr key={s.key} style={{ background: i % 2 === 0 ? '#f1f5f9' : '#ffffff' }}>
                      <td className="py-2 px-1.5 text-center font-mono" style={{ color: '#94a3b8', fontSize: '9px' }}>{i + 1}</td>
                      <td className="py-2 px-1.5 bangla font-medium" style={{ color: '#334155', fontSize: '10px' }}>
                        {s.label}
                        {s.isFourth && <span className="ml-1 text-[8px] px-1 py-0.5 rounded" style={{ background: '#f3e8ff', color: '#7e22ce' }}>৪র্থ</span>}
                      </td>
                      <td className="py-2 px-1.5 text-center font-mono" style={{ color: '#64748b' }}>
                        {s.naib > 0 ? s.naib : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td className="py-2 px-1.5 text-center font-mono" style={{ color: '#64748b' }}>{s.written}</td>
                      <td className="py-2 px-1.5 text-center font-bold font-mono" style={{ color: '#1e293b', fontSize: '11px' }}>{s.total}</td>
                      <td className="py-2 px-1.5 text-center">
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                          style={{ background: sgc.bg, color: sgc.text, border: `1px solid ${sgc.border}` }}>{s.grade}</span>
                      </td>
                      <td className="py-2 px-1.5 text-center font-bold font-mono" style={{ color: sgc.text, fontSize: '10.5px' }}>{s.gpa.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'linear-gradient(90deg,#1a3a5c,#1e5a8e)' }}>
                  <td colSpan={4} className="py-2.5 px-3 bangla font-bold text-right text-white" style={{ fontSize: '10px' }}>সর্বমোট নম্বর</td>
                  <td className="py-2.5 px-1.5 text-center font-bold font-mono" style={{ color: '#fbbf24', fontSize: '12px' }}>{result.totalMarks}</td>
                  <td className="py-2.5 px-1.5 text-center">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: gc.bg, color: gc.text, border: `1px solid ${gc.border}` }}>{result.cgpaGrade}</span>
                  </td>
                  <td className="py-2.5 px-1.5 text-center font-bold font-mono" style={{ color: '#fbbf24', fontSize: '12px' }}>{result.cgpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Result banner */}
          <div className="mx-4 mb-3 rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${result.passed ? '#6ee7b7' : '#fca5a5'}` }}>
            <div style={{ background: result.passed ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#7f1d1d,#991b1b)' }}
              className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: result.passed ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)' }}>
                {result.passed ? <Award size={24} color="#34d399"/> : <AlertCircle size={24} color="#f87171"/>}
              </div>
              <div className="flex-1">
                <p className="bangla font-bold text-white" style={{ fontSize: '14px' }}>
                  {result.passed ? '✓ উত্তীর্ণ' : '✗ অনুত্তীর্ণ'}
                </p>
                <p className="bangla text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {result.passed ? 'অভিনন্দন! চমৎকার ফলাফল।' : 'আরো মনোযোগ দিয়ে পড়াশোনা করুন।'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold font-mono" style={{ color: result.passed ? '#34d399' : '#f87171' }}>
                  {result.cgpa.toFixed(2)}
                </p>
                <p className="bangla text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>সিজিপিএ</p>
              </div>
            </div>
          </div>

          {/* Grade scale + signature in one row */}
          <div className="mx-4 mb-3 grid grid-cols-2 gap-3">
            {/* Grade scale */}
            <div className="p-2.5 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="bangla text-[9px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>গ্রেড স্কেল</p>
              <div className="flex flex-wrap gap-1">
                {[['A+','5.00'],['A','4.00'],['A-','3.50'],['B','3.00'],['C','2.00'],['D','1.00'],['F','0.00']].map(([g, p]) => {
                  const c = GRADE_COLORS[g]
                  return (
                    <span key={g} className="text-[8px] px-1.5 py-0.5 rounded font-bold font-mono"
                      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{g}={p}</span>
                  )
                })}
              </div>
            </div>
            {/* Summary box */}
            <div className="p-2.5 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="bangla text-[9px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>সারসংক্ষেপ</p>
              <div className="space-y-1">
                {[
                  ['মোট বিষয়', result.subjects.length],
                  ['মোট নম্বর', result.totalMarks],
                  ['সিজিপিএ', result.cgpa.toFixed(2)],
                  ['গ্রেড', result.cgpaGrade],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="bangla text-[9px]" style={{ color: '#64748b' }}>{k}</span>
                    <span className="font-bold font-mono text-[9px]" style={{ color: '#1e293b' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mx-4 mb-3 grid grid-cols-3 gap-4">
            {['শিক্ষার্থীর স্বাক্ষর', 'অভিভাবকের স্বাক্ষর', 'অধ্যক্ষের সীলমোহর'].map(label => (
              <div key={label} className="text-center">
                <div className="h-8 border-b border-dashed mb-1" style={{ borderColor: '#94a3b8' }}/>
                <p className="bangla text-[8.5px]" style={{ color: '#94a3b8' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 text-center" style={{ background: 'linear-gradient(90deg,#0a1628,#1a3a5c)' }}>
            <p className="bangla text-[9px]" style={{ color: '#93c5fd' }}>
              এই মার্কশিট কম্পিউটার প্রদত্ত এবং স্বাক্ষর ছাড়াই বৈধ
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
