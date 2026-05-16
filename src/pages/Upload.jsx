import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CLASS_GROUPS, EXAM_TYPES } from '../lib/grades'
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

const n = v => Number(v)||0

const MAP_PLAY = r => ({ bangla1_written:n(r[2]), math_written:n(r[3]), english1:n(r[4]), islam_written:n(r[5]), bgst_written:n(r[6]), krishi_written:n(r[7]) })
const MAP_1    = r => ({ bangla1_written:n(r[2]), english1:n(r[3]), math_written:n(r[4]), science_written:n(r[5]), islam_written:n(r[6]), krishi_written:n(r[7]), bgst_written:n(r[8]) })
const MAP_2    = r => ({ bangla1_written:n(r[2]), bangla2_written:n(r[3]), english1:n(r[4]), english2:n(r[5]), math_written:n(r[6]), science_written:n(r[7]), islam_written:n(r[8]), ict:n(r[9]), krishi_written:n(r[10]), bgst_written:n(r[11]) })
const MAP_3    = r => ({ bangla1_written:n(r[2]), bangla2_written:n(r[3]), english1:n(r[4]), english2:n(r[5]), math_written:n(r[6]), science_written:n(r[7]), bgst_written:n(r[8]), islam_written:n(r[9]), ict:n(r[10]), krishi_written:n(r[11]), physics_written:n(r[12]) })
const MAP_4    = r => ({ bangla1_written:n(r[2]), bangla2_written:n(r[3]), english1:n(r[4]), english2:n(r[5]), math_written:n(r[6]), science_written:n(r[7]), bgst_written:n(r[8]), islam_written:n(r[9]), ict:n(r[10]), krishi_written:n(r[11]) })
const MAP_5    = r => ({ bangla1_written:n(r[2]), bangla2_written:n(r[3]), english1:n(r[4]), english2:n(r[5]), math_written:n(r[6]), science_written:n(r[7]), bgst_written:n(r[8]), islam_written:n(r[9]) })
const MAP_6_8  = r => ({ bangla1_naib:n(r[2]), bangla1_written:n(r[3]), bangla2_naib:n(r[4]), bangla2_written:n(r[5]), english1:n(r[6]), english2:n(r[7]), math_naib:n(r[8]), math_written:n(r[9]), science_naib:n(r[10]), science_written:n(r[11]), bgst_naib:n(r[12]), bgst_written:n(r[13]), islam_naib:n(r[14]), islam_written:n(r[15]), krishi_naib:n(r[16]), krishi_written:n(r[17]), ict:n(r[18]) })
const MAP_9_10 = r => ({ bangla1_naib:n(r[2]), bangla1_written:n(r[3]), bangla2_naib:n(r[4]), bangla2_written:n(r[5]), english1:n(r[6]), english2:n(r[7]), math_naib:n(r[8]), math_written:n(r[9]), physics_naib:n(r[10]), physics_written:n(r[11]), chemistry_naib:n(r[12]), chemistry_written:n(r[13]), biology_naib:n(r[14]), biology_written:n(r[15]), higher_math_naib:n(r[16]), higher_math_written:n(r[17]), bgst_naib:n(r[18]), bgst_written:n(r[19]), islam_naib:n(r[20]), islam_written:n(r[21]), ict:n(r[22]) })

const getMapper = c => {
  if (c==='play'||c==='nursery') return MAP_PLAY
  if (c==='1') return MAP_1; if (c==='2') return MAP_2
  if (c==='3') return MAP_3; if (c==='4') return MAP_4
  if (c==='5') return MAP_5
  if (['6','7','8'].includes(c)) return MAP_6_8
  return MAP_9_10
}

const TMPL = {
  play:    { h:['বাংলা(১০০)','গণিত(১০০)','ইংরেজি(১০০)','ধর্ম(১০০)','ছবি অংকন(৫০)','সাধারণ জ্ঞান(৫০)'], s:[85,78,72,90,42,38] },
  nursery: { h:['বাংলা(১০০)','গণিত(১০০)','ইংরেজি(১০০)','ধর্ম(১০০)','ছবি অংকন(৫০)','সাধারণ জ্ঞান(৫০)'], s:[80,75,68,88,40,35] },
  '1':     { h:['বাংলা(১০০)','ইংরেজি(১০০)','গণিত(১০০)','পরিবেশ(১০০)','ধর্ম(১০০)','সাধারণ(৫০)','ছবি অংকন(৫০)'], s:[82,70,88,76,91,44,41] },
  '2':     { h:['বাং১ম(১০০)','বাং২য়(৫০)','ইং১ম(১০০)','ইং২য়(৫০)','গণিত(১০০)','পরিবেশ(১০০)','ধর্ম(১০০)','কম্পিউটার(৫০)','সাধারণ(৫০)','ছবি(৫০)'], s:[75,38,65,40,80,70,85,42,44,45] },
  '3':     { h:['বাং১ম(১০০)','বাং২য়(১০০)','ইং১ম(১০০)','ইং২য়(১০০)','গণিত(১০০)','বিজ্ঞান(১০০)','পরিবেশ(১০০)','ধর্ম(১০০)','কম্পিউটার(৫০)','সাধারণ(৫০)','ছবি অংকন(৫০)'], s:[72,68,65,70,80,75,78,88,42,44,45] },
  '4':     { h:['বাং১ম(১০০)','বাং২য়(১০০)','ইং১ম(১০০)','ইং২য়(১০০)','গণিত(১০০)','বিজ্ঞান(১০০)','পরিবেশ(১০০)','ধর্ম(১০০)','কম্পিউটার(৫০)','সাধারণ(৫০)'], s:[75,70,68,72,82,78,80,90,44,46] },
  '5':     { h:['বাং১ম(১০০)','বাং২য়(১০০)','ইং১ম(১০০)','ইং২য়(১০০)','গণিত(১০০)','বিজ্ঞান(১০০)','পরিবেশ(১০০)','ধর্ম(১০০)'], s:[78,72,70,74,85,80,82,92] },
  '6':     { h:['বাং১নৈব','বাং১লিখিত','বাং২নৈব','বাং২লিখিত','ইং১ম','ইং২য়','গণিতনৈব','গণিতলিখিত','বিজ্ঞাননৈব','বিজ্ঞানলিখিত','বাওবিনৈব','বাওবিলিখিত','ইসলামনৈব','ইসলামলিখিত','কৃষিনৈব','কৃষিলিখিত','তথ্য'], s:[18,62,17,25,66,45,28,45,16,67,17,45,11,29,27,56,22] },
  '7':     { h:['বাং১নৈব','বাং১লিখিত','বাং২নৈব','বাং২লিখিত','ইং১ম','ইং২য়','গণিতনৈব','গণিতলিখিত','বিজ্ঞাননৈব','বিজ্ঞানলিখিত','বাওবিনৈব','বাওবিলিখিত','ইসলামনৈব','ইসলামলিখিত','কৃষিনৈব','কৃষিলিখিত','তথ্য'], s:[18,62,17,25,66,45,28,45,16,67,17,45,11,29,27,56,22] },
  '8':     { h:['বাং১নৈব','বাং১লিখিত','বাং২নৈব','বাং২লিখিত','ইং১ম','ইং২য়','গণিতনৈব','গণিতলিখিত','বিজ্ঞাননৈব','বিজ্ঞানলিখিত','বাওবিনৈব','বাওবিলিখিত','ইসলামনৈব','ইসলামলিখিত','কৃষিনৈব','কৃষিলিখিত','তথ্য'], s:[18,62,17,25,66,45,28,45,16,67,17,45,11,29,27,56,22] },
  '9':     { h:['বাং১নৈব','বাং১লিখিত','বাং২নৈব','বাং২লিখিত','ইং১ম','ইং২য়','গণিতনৈব','গণিতলিখিত','পদার্থনৈব','পদার্থলিখিত','রসায়ননৈব','রসায়নলিখিত','জীবনৈব','জীবলিখিত','উচ্চনৈব','উচ্চলিখিত','বাবিপনৈব','বাবিপলিখিত','ইসলামনৈব','ইসলামলিখিত','তথ্য'], s:[18,62,17,25,66,45,28,45,16,67,17,45,11,29,27,56,22,10,14,15,20] },
  '10':    { h:['বাং১নৈব','বাং১লিখিত','বাং২নৈব','বাং২লিখিত','ইং১ম','ইং২য়','গণিতনৈব','গণিতলিখিত','পদার্থনৈব','পদার্থলিখিত','রসায়ননৈব','রসায়নলিখিত','জীবনৈব','জীবলিখিত','উচ্চনৈব','উচ্চলিখিত','বাবিপনৈব','বাবিপলিখিত','ইসলামনৈব','ইসলামলিখিত','তথ্য'], s:[18,62,17,25,66,45,28,45,16,67,17,45,11,29,27,56,22,10,14,15,20] },
}

function downloadTemplate(classNum) {
  const cfg = TMPL[classNum] || TMPL['9']
  const label = CLASS_GROUPS[classNum]?.label || classNum
  const wb = XLSX.utils.book_new()
  const rows = [
    ['গোল্ডেন লাইফ পাবলিক স্কুল'],
    ['পাইকরতলী, কাজিপুর, সিরাজগঞ্জ'],
    ['নির্বাচনী পরীক্ষা ২০২৫'],
    [`শ্রেণিঃ ${label}`],
    ['রোল', 'নাম', ...cfg.h],
    ['', '', ...cfg.h.map(() => '')],
    [1, 'নমুনা ছাত্র', ...cfg.s],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'মেইন শিট')
  XLSX.writeFile(wb, `template_class_${classNum}.xlsx`)
}

function parseFile(file, classNum) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        const mapper = getMapper(classNum)
        const students = []
        for (let i = 6; i < data.length; i++) {
          const row = data[i]
          if (!row[0] || isNaN(Number(row[0]))) continue
          const name = String(row[1] || '').trim()
          if (!name) continue
          students.push({ roll: Number(row[0]), name, class_num: classNum, exam_year: '', exam_type: '', ...mapper(row) })
        }
        resolve(students)
      } catch (err) { reject(new Error('ফাইল পড়তে সমস্যা: ' + err.message)) }
    }
    reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি'))
    reader.readAsArrayBuffer(file)
  })
}

export default function Upload() {
  const [classNum, setClassNum] = useState('9')
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString())
  const [examType, setExamType] = useState(EXAM_TYPES[1])
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')
  const inputRef = useRef()
  const navigate = useNavigate()
  const years = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - i).toString())

  async function handleFile(f) {
    if (!f) return
    setFile(f); setError(''); setPreview([])
    try { setPreview(await parseFile(f, classNum)) } catch (e) { setError(e.message) }
  }

  async function handleUpload() {
    if (!preview.length) return
    setLoading(true); setError('')
    try {
      const tagged = preview.map(s => ({ ...s, class_num: classNum, exam_year: examYear, exam_type: examType }))
      for (let i = 0; i < tagged.length; i += 50) {
        const { error: err } = await supabase.from('students').insert(tagged.slice(i, i + 50))
        if (err) throw err
      }
      setSuccess(true)
      setTimeout(() => navigate('/students'), 1500)
    } catch (e) { setError('আপলোড ব্যর্থ: ' + e.message) }
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
      <div className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-gold-400 bangla">Excel আপলোড</h2>
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 block">পরীক্ষার সাল</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {years.map(y => (
              <button key={y} type="button" onClick={() => setExamYear(y)}
                className={`bangla text-sm px-3 py-1.5 rounded-lg flex-shrink-0 font-medium transition-all ${examYear===y?'gold-gradient text-navy-900':'glass text-slate-400'}`}>{y}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 block">পরীক্ষার ধরন</label>
          <div className="flex flex-col gap-1.5">
            {EXAM_TYPES.map(e => (
              <button key={e} type="button" onClick={() => setExamType(e)}
                className={`bangla text-sm px-3 py-2 rounded-lg text-left transition-all ${examType===e?'bg-navy-700 text-gold-400 border border-gold-500/30':'glass text-slate-400'}`}>{e}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 bangla mb-1.5 block">শ্রেণি</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CLASS_GROUPS).map(([num, c]) => (
              <button key={num} type="button" onClick={() => { setClassNum(num); setFile(null); setPreview([]) }}
                className={`bangla text-sm px-4 py-2 rounded-xl font-medium transition-all ${classNum===num?'gold-gradient text-navy-900':'glass text-slate-400'}`}>{c.label}</button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => downloadTemplate(classNum)}
        className="w-full flex items-center justify-center gap-2 glass py-3 rounded-xl text-sm text-gold-400 bangla hover:bg-white/5 transition-all">
        <Download size={16}/> ডেমো Excel ডাউনলোড (শ্রেণি {CLASS_GROUPS[classNum]?.label})
      </button>

      <button onClick={() => inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all ${file?'border-gold-500/50 bg-gold-500/5':'border-white/10 hover:border-white/20'}`}>
        <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/20">
          <FileSpreadsheet size={24} className="text-navy-900"/>
        </div>
        {file ? (
          <><p className="text-sm font-semibold text-gold-400 truncate max-w-full px-4">{file.name}</p>
          <p className="text-xs text-slate-500 bangla">{preview.length} জন পাওয়া গেছে</p></>
        ) : (
          <><p className="text-sm text-slate-300 bangla">ফাইল বেছে নিন (.xlsx)</p>
          <p className="text-xs text-slate-500 bangla">শ্রেণি {CLASS_GROUPS[classNum]?.label} · {examYear} · {examType}</p></>
        )}
      </button>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.xlsm" className="hidden" onChange={e => handleFile(e.target.files[0])}/>

      {preview.length > 0 && (
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 bangla">প্রিভিউ — {preview.length} জন</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-slate-500 border-b border-white/5">
                <th className="text-left py-1.5 bangla">রোল</th><th className="text-left py-1.5 bangla">নাম</th>
                <th className="text-right py-1.5 bangla">বাং</th><th className="text-right py-1.5 bangla">গণিত</th>
              </tr></thead>
              <tbody>
                {preview.slice(0, 6).map((s, i) => (
                  <tr key={i} className="border-b border-white/5 text-slate-300">
                    <td className="py-1.5 font-mono">{s.roll}</td>
                    <td className="py-1.5 bangla truncate max-w-[100px]">{s.name}</td>
                    <td className="py-1.5 text-right font-mono">{(s.bangla1_naib||0)+(s.bangla1_written||0)}</td>
                    <td className="py-1.5 text-right font-mono">{(s.math_naib||0)+(s.math_written||0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 6 && <p className="text-center text-xs text-slate-600 py-2 bangla">আরো {preview.length-6} জন...</p>}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm bangla">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>{error}
        </div>
      )}

      {preview.length > 0 && (
        <div className="flex gap-3">
          <button onClick={() => { setFile(null); setPreview([]) }} className="btn-ghost flex items-center gap-2 bangla">
            <Trash2 size={14}/>বাতিল
          </button>
          <button onClick={handleUpload} disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 bangla disabled:opacity-50">
            <UploadIcon size={16}/>{loading ? 'আপলোড হচ্ছে...' : `${preview.length} জন আপলোড করুন`}
          </button>
        </div>
      )}
    </div>
  )
}
