import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcResult, CLASS_GROUPS } from '../lib/grades'
import { buildMarksheetHTML, generatePDF, MS_W } from '../lib/marksheetBuilder'
import { ArrowLeft, Printer, Share2, Trash2, Download, Pencil } from 'lucide-react'

export default function Marksheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy,    setBusy]    = useState(false)
  const ref = useRef()

  useEffect(() => {
    supabase.from('students').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setStudent(data); setResult(calcResult(data)) }
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (student && ref.current) ref.current.innerHTML = buildMarksheetHTML(student)
  }, [student])

  async function handleDelete() {
    if (!confirm('এই মার্কশিট মুছে ফেলবেন?')) return
    await supabase.from('students').delete().eq('id', id)
    navigate('/students')
  }

  async function handleShare() {
    if (navigator.share) await navigator.share({ title: `${student.name} - মার্কশিট`, text: `রোল: ${student.roll} | CGPA: ${result.cgpa.toFixed(2)}` })
  }

  async function handlePDF() {
    setBusy(true)
    try { await generatePDF(student, `marksheet_${student.name}_${student.roll}.pdf`) }
    catch { window.print() }
    setBusy(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"/></div>
  if (!student) return <div className="text-center py-20 text-slate-500 bangla">তথ্য পাওয়া যায়নি</div>

  return (
    <>
      <style>{`
        @import url('https://fonts.maateen.me/kalpurush/font.css');
        @media print {
          .no-print{display:none!important}
          body,html{background:white!important;margin:0!important;padding:0!important}
          .print-outer{padding:0!important;overflow:visible!important}
          @page{size:A4 portrait;margin:0}
          *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        }
      `}</style>

      <div className="no-print sticky top-0 z-30 glass-dark px-4 py-3 flex items-center gap-2">
        <button onClick={()=>navigate(-1)} className="w-9 h-9 glass rounded-xl flex items-center justify-center"><ArrowLeft size={18}/></button>
        <span className="flex-1 text-sm font-semibold text-white bangla truncate">{student.name}</span>
        <button onClick={()=>navigate(`/edit/${id}`)} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-blue-400"><Pencil size={15}/></button>
        <button onClick={handleShare} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400"><Share2 size={16}/></button>
        <button onClick={handleDelete} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-rose-400"><Trash2 size={15}/></button>
        <button onClick={handlePDF} disabled={busy} className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm bangla disabled:opacity-60">
          <Download size={15}/>{busy?'...':'PDF'}
        </button>
        <button onClick={()=>window.print()} className="glass flex items-center gap-1.5 py-2 px-3 text-sm bangla text-slate-300 rounded-xl">
          <Printer size={15}/>প্রিন্ট
        </button>
      </div>

      <div className="print-outer p-3 pb-8 overflow-x-auto">
        <div ref={ref} style={{ width: MS_W, margin: '0 auto' }}/>
      </div>
    </>
  )
}
