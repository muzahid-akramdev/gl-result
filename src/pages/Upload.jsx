import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CLASS_GROUPS, EXAM_TYPES } from '../lib/grades'
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

// Class 6-8 col map (0-indexed): C=2 D=3 বাং১ | E=4 F=5 বাং২ | G=6 ইং১ | H=7 ইং২
// I=8 J=9 গণিত | K=10 L=11 বিজ্ঞান | M=12 N=13 বাওবি | O=14 P=15 ইসলাম
// Q=16 R=17 কৃষি | S=18 তথ্যপ্রযুক্তি
const MAP_6_8 = r => ({
  bangla1_naib:n(r[2]),   bangla1_written:n(r[3]),
  bangla2_naib:n(r[4]),   bangla2_written:n(r[5]),
  english1:n(r[6]),       english2:n(r[7]),
  math_naib:n(r[8]),      math_written:n(r[9]),
  science_naib:n(r[10]),  science_written:n(r[11]),
  bgst_naib:n(r[12]),     bgst_written:n(r[13]),
  islam_naib:n(r[14]),    islam_written:n(r[15]),
  krishi_naib:n(r[16]),   krishi_written:n(r[17]),
  ict:n(r[18]),
})

// Class 9-10 col map: C=2 D=3 বাং১ | E=4 F=5 বাং২ | G=6 ইং১ | H=7 ইং২
// I=8 J=9 গণিত | K=10 L=11 পদার্থ | M=12 N=13 রসায়ন | O=14 P=15 জীব
// Q=16 R=17 উচ্চ/কৃষি | S=18 T=19 বাবিপ | U=20 V=21 ইসলাম | W=22 তথ্যপ্রযুক্তি
const MAP_9_10 = r => ({
  bangla1_naib:n(r[2]),      bangla1_written:n(r[3]),
  bangla2_naib:n(r[4]),      bangla2_written:n(r[5]),
  english1:n(r[6]),          english2:n(r[7]),
  math_naib:n(r[8]),         math_written:n(r[9]),
  physics_naib:n(r[10]),     physics_written:n(r[11]),
  chemistry_naib:n(r[12]),   chemistry_written:n(r[13]),
  biology_naib:n(r[14]),     biology_written:n(r[15]),
  higher_math_naib:n(r[16]), higher_math_written:n(r[17]),
  bgst_naib:n(r[18]),        bgst_written:n(r[19]),
  islam_naib:n(r[20]),       islam_written:n(r[21]),
  ict:n(r[22]),
})

const n = v => Number(v)||0

function parseFile(file, classNum) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const wb   = XLSX.read(e.target.result, {type:'array'})
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''})
        const is68 = ['6','7','8'].includes(String(classNum))
        const students = []
        for (let i=6; i<data.length; i++) {
          const row=data[i]
          if (!row[0]||isNaN(Number(row[0]))) continue
          const name=String(row[1]||'').trim()
          if (!name) continue
          students.push({
            roll:Number(row[0]), name,
            class_num:classNum, exam_year:'', exam_type:'',
            ...(is68 ? MAP_6_8(row) : MAP_9_10(row))
          })
        }
        resolve(students)
      } catch(err) { reject(new Error('ফাইল পড়তে সমস্যা: '+err.message)) }
    }
    reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি'))
    reader.readAsArrayBuffer(file)
  })
}

// Generate demo Excel template
function downloadTemplate(classNum) {
  const is68 = ['6','7','8'].includes(String(classNum))
  const wb = XLSX.utils.book_new()
  const headers1 = ['রোল','নাম']
  const headers2 = ['','']

  if (is68) {
    headers1.push(...['বাংলা ১ম পত্র','','বাংলা ২য় পত্র','','ইংরেজি ১ম','ইংরেজি ২য়','গণিত','','বিজ্ঞান','','বাওবি','','ইসলাম','','কৃষি','','তথ্যপ্রযুক্তি','মোট','Pass/Fail','CGPA','অবস্থান'])
    headers2.push(...['নৈব','লিখিত','নৈব','লিখিত','','','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত',''])
  } else {
    headers1.push(...['বাংলা ১ম','','বাংলা ২য়','','ইং ১ম','ইং ২য়','গণিত','','পদার্থ','','রসায়ন','','জীব','','উচ্চ/কৃষি','','বাবিপ','','ইসলাম','','তথ্য','মোট','Pass/Fail','CGPA','অবস্থান'])
    headers2.push(...['নৈব','লিখিত','নৈব','লিখিত','','','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত','নৈব','লিখিত',''])
  }

  // Title rows
  const titleRows = [
    ['গোল্ডেন লাইফ পাবলিক স্কুল'],
    ['পাইকরতলী, কাজিপুর, সিরাজগঞ্জ'],
    ['নির্বাচনী পরীক্ষা ২০২৫'],
    [`শ্রেণিঃ ${CLASS_GROUPS[classNum]?.label || classNum}`],
    headers1,
    headers2,
    [1,'নমুনা ছাত্র', ...(is68?[18,62,17,25,66,45,28,45,16,67,17,45,11,29,27,56,22]:[18,62,17,25,66,45,28,45,16,67,17,45,11,29,27,56,22,10,14,15,20])],
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(titleRows)
  XLSX.utils.book_append_sheet(wb, ws2, 'মেইন শিট')
  XLSX.writeFile(wb, `template_class_${classNum}.xlsx`)
}

export default function Upload() {
  const [classNum, setClassNum] = useState('9')
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString())
  const [examType, setExamType] = useState(EXAM_TYPES[1])
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const inputRef = useRef()
  const navigate = useNavigate()
  const years = Array.from({length:6},(_,i)=>(new Date().getFullYear()-i).toString())

  async function handleFile(f) {
    if (!f) return
    setFile(f); setError(''); setPreview([])
    try {
      const students = await parseFile(f, classNum)
      setPreview(students)
    } catch(e) { setError(e.message) }
  }

  async function handleUpload() {
    if (!preview.length) return
    setLoading(true); setError('')
    try {
      const rows = preview.map(s=>({...s, exam_year:examYear, exam_type:examType}))
      // Delete same class+year+exam first
      await supabase.from('students').delete()
        .eq('class_num',classNum).eq('exam_year',examYear).eq('exam_type',examType)
      for (let i=0; i<rows.length; i+=50) {
        const {error:err} = await supabase.from('students').insert(rows.slice(i,i+50))
        if (err) throw err
      }
      setSuccess(true)
      setTimeout(()=>navigate('/students'),1500)
    } catch(e) { setError('আপলোড ব্যর্থ: '+e.message) }
    setLoading(false)
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-scale-in">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <CheckCircle size={32} className="text-emerald-400"/>
      </div>
      <p className="bangla text-lg font-semibold text-white">{preview.length} জন আপলোড সম্পন্ন!</p>
    </div>
  )

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Config */}
      <div className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-gold-400 bangla">Excel আপলোড</h2>

        {/* Year */}
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 block">পরীক্ষার সাল</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {years.map(y=>(
              <button key={y} type="button" onClick={()=>setExamYear(y)}
                className={`bangla text-sm px-3 py-1.5 rounded-lg flex-shrink-0 font-medium transition-all ${examYear===y?'gold-gradient text-navy-900':'glass text-slate-400'}`}>{y}</button>
            ))}
          </div>
        </div>

        {/* Exam type */}
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 block">পরীক্ষার ধরন</label>
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
              <button key={n} type="button" onClick={()=>{setClassNum(n);setFile(null);setPreview([])}}
                className={`bangla text-sm px-4 py-2 rounded-xl font-medium transition-all ${classNum===n?'gold-gradient text-navy-900':'glass text-slate-400'}`}>{c.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Template download */}
      <button onClick={()=>downloadTemplate(classNum)}
        className="w-full flex items-center justify-center gap-2 glass py-3 rounded-xl text-sm text-gold-400 bangla hover:bg-white/5 transition-all">
        <Download size={16}/> ডেমো Excel ডাউনলোড করুন (শ্রেণি {CLASS_GROUPS[classNum]?.label})
      </button>

      {/* File drop */}
      <button onClick={()=>inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all ${file?'border-gold-500/50 bg-gold-500/5':'border-white/10 hover:border-white/20'}`}>
        <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/20">
          <FileSpreadsheet size={24} className="text-navy-900"/>
        </div>
        {file ? (
          <>
            <p className="text-sm font-semibold text-gold-400 truncate max-w-full px-4">{file.name}</p>
            <p className="text-xs text-slate-500 bangla">{preview.length} জন পাওয়া গেছে</p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-300 bangla">ফাইল বেছে নিন (.xlsx)</p>
            <p className="text-xs text-slate-500 bangla">শ্রেণি {CLASS_GROUPS[classNum]?.label} · {examYear} · {examType}</p>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.xlsm" className="hidden"
        onChange={e=>handleFile(e.target.files[0])}/>

      {/* Preview */}
      {preview.length>0&&(
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 bangla">প্রিভিউ — {preview.length} জন</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-slate-500 border-b border-white/5">
                <th className="text-left py-1.5 bangla">রোল</th><th className="text-left py-1.5 bangla">নাম</th>
                <th className="text-right py-1.5 bangla">বাং১</th><th className="text-right py-1.5 bangla">গণিত</th>
              </tr></thead>
              <tbody>
                {preview.slice(0,6).map((s,i)=>(
                  <tr key={i} className="border-b border-white/5 text-slate-300">
                    <td className="py-1.5 font-mono">{s.roll}</td>
                    <td className="py-1.5 bangla truncate max-w-[100px]">{s.name}</td>
                    <td className="py-1.5 text-right font-mono">{(s.bangla1_naib||0)+(s.bangla1_written||0)}</td>
                    <td className="py-1.5 text-right font-mono">{(s.math_naib||0)+(s.math_written||0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length>6&&<p className="text-center text-xs text-slate-600 py-2 bangla">আরো {preview.length-6} জন...</p>}
          </div>
        </div>
      )}

      {error&&(
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm bangla">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>{error}
        </div>
      )}

      {preview.length>0&&(
        <div className="flex gap-3">
          <button onClick={()=>{setFile(null);setPreview([])}} className="btn-ghost flex items-center gap-2 bangla">
            <Trash2 size={14}/>বাতিল
          </button>
          <button onClick={handleUpload} disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 bangla disabled:opacity-50">
            <UploadIcon size={16}/>{loading?'আপলোড হচ্ছে...':`${preview.length} জন আপলোড করুন`}
          </button>
        </div>
      )}
    </div>
  )
}
