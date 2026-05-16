import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, GRADE_COLORS, CLASS_GROUPS } from '../lib/grades'
import { buildMarksheetHTML, MS_WIDTH } from '../lib/marksheetBuilder'
import { ArrowLeft, Printer, Share2, Trash2, Download, Pencil } from 'lucide-react'

export default function Marksheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const containerRef = useRef()

  useEffect(() => {
    supabase.from('students').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setStudent(data); setResult(calcResult(data)) }
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (student && containerRef.current) {
      containerRef.current.innerHTML = buildMarksheetHTML(student)
    }
  }, [student])

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

  async function loadPDFLib() {
    if (window.html2pdf) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    document.head.appendChild(script)
    await new Promise(r => { script.onload = r })
  }

  async function handlePDF() {
    setPdfLoading(true)
    try {
      await loadPDFLib()
      const wrapper = document.createElement('div')
      wrapper.innerHTML = buildMarksheetHTML(student)
      document.body.appendChild(wrapper)
      await window.html2pdf().set({
        margin: 0,
        filename: `marksheet_${student.name}_${student.roll}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, width: MS_WIDTH, windowWidth: MS_WIDTH },
        jsPDF: { unit: 'px', format: [MS_WIDTH, 1123], orientation: 'portrait' },
      }).from(wrapper).save()
      document.body.removeChild(wrapper)
    } catch { window.print() }
    setPdfLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"/>
    </div>
  )
  if (!student) return <div className="text-center py-20 text-slate-500 bangla">তথ্য পাওয়া যায়নি</div>

  return (
    <>
      <style>{`
        @import url('https://fonts.maateen.me/kalpurush/font.css');
        .bangla, .bangla * { font-family:'Kalpurush','SolaimanLipi','Noto Sans Bengali',sans-serif !important; }
        @media print {
          .no-print { display:none !important; }
          body,html { background:white !important; margin:0 !important; padding:0 !important; }
          .print-scroll { overflow:visible !important; padding:0 !important; }
          .ms-scale-wrap { transform:scale(0.72) !important; transform-origin:top left !important; }
          @page { size:A4 portrait; margin:0; }
          * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
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

      {/* Marksheet preview */}
      <div className="print-scroll p-3 pb-8 overflow-x-auto">
        <div className="ms-scale-wrap" style={{ width: MS_WIDTH, margin: '0 auto' }} ref={containerRef}/>
      </div>
    </>
  )
}
