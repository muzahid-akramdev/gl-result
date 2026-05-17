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
    if (navigator.share) await navigator.share({
      title: `${student.name} - মার্কশিট`,
      text: `রোল: ${student.roll} | CGPA: ${result.cgpa.toFixed(2)} | ${result.passed ? 'Pass' : 'Fail'}`,
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"/>
    </div>
  )
  if (!student) return <div className="text-center py-20 text-slate-500 bangla">তথ্য পাওয়া যায়নি</div>

  return (
    <>
      <style>{`@import url('https://fonts.maateen.me/kalpurush/font.css');`}</style>

      <div className="sticky top-0 z-30 glass-dark px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-xl flex items-center justify-center"><ArrowLeft size={18}/></button>
        <span className="flex-1 text-sm font-semibold text-white bangla truncate">{student.name}</span>
        <button onClick={() => navigate(`/edit/${id}`)} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-blue-400"><Pencil size={15}/></button>
        <button onClick={handleShare} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400"><Share2 size={16}/></button>
        <button onClick={handleDelete} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-rose-400"><Trash2 size={15}/></button>
        <button
          onClick={() => generatePDF(student, `marksheet_${student.name}_${student.roll}.pdf`)}
          className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm bangla">
          <Download size={15}/>PDF / প্রিন্ট
        </button>
      </div>

      <div className="p-3 pb-8 overflow-x-auto">
        <div ref={ref} style={{ width: MS_W, margin: '0 auto' }}/>
      </div>
    </>
  )
}
