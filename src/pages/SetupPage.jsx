import { useState } from 'react'
import { GraduationCap, Database, ExternalLink, Copy, CheckCircle, AlertTriangle } from 'lucide-react'

export default function SetupPage() {
  const [url,  setUrl]  = useState('')
  const [key,  setKey]  = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!url.startsWith('https://') || key.length < 20) return
    localStorage.setItem('sb_url', url.trim())
    localStorage.setItem('sb_key', key.trim())
    setSaved(true)
    // Inject and reload
    setTimeout(() => {
      window.__SB_URL__ = url.trim()
      window.__SB_KEY__ = key.trim()
      window.location.reload()
    }, 800)
  }

  const SQL = `CREATE TABLE IF NOT EXISTS students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  roll integer NOT NULL,
  name text NOT NULL,
  class_num text NOT NULL DEFAULT '9',
  exam_year text NOT NULL DEFAULT '2025',
  bangla1_naib numeric DEFAULT 0, bangla1_written numeric DEFAULT 0,
  bangla2_naib numeric DEFAULT 0, bangla2_written numeric DEFAULT 0,
  english1 numeric DEFAULT 0, english2 numeric DEFAULT 0,
  math_naib numeric DEFAULT 0, math_written numeric DEFAULT 0,
  science_naib numeric DEFAULT 0, science_written numeric DEFAULT 0,
  physics_naib numeric DEFAULT 0, physics_written numeric DEFAULT 0,
  chemistry_naib numeric DEFAULT 0, chemistry_written numeric DEFAULT 0,
  biology_naib numeric DEFAULT 0, biology_written numeric DEFAULT 0,
  higher_math_naib numeric DEFAULT 0, higher_math_written numeric DEFAULT 0,
  krishi_naib numeric DEFAULT 0, krishi_written numeric DEFAULT 0,
  bgst_naib numeric DEFAULT 0, bgst_written numeric DEFAULT 0,
  islam_naib numeric DEFAULT 0, islam_written numeric DEFAULT 0,
  ict numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON students FOR ALL USING (true) WITH CHECK (true);`

  return (
    <div className="min-h-dvh bg-navy-950 px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/30 animate-float">
          <GraduationCap size={30} className="text-navy-900" />
        </div>
        <h1 className="bangla text-2xl font-bold text-white">গোল্ডেন লাইফ পাবলিক স্কুল</h1>
        <p className="bangla text-sm text-slate-400">প্রথমবার সেটআপ করুন</p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="bangla text-sm text-amber-300">
          অ্যাপটি ব্যবহার করতে Supabase এ একটি বিনামূল্যে অ্যাকাউন্ট দরকার। নিচের ধাপগুলো অনুসরণ করুন।
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <Step n="১" title="Supabase অ্যাকাউন্ট তৈরি করুন">
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-gold-400 text-sm bangla">
            supabase.com এ যান <ExternalLink size={12} />
          </a>
          <p className="bangla text-sm text-slate-400 mt-1">Sign Up → New Project → নাম দিন "gl-result"</p>
        </Step>

        <Step n="২" title="SQL চালান">
          <p className="bangla text-sm text-slate-400 mb-2">SQL Editor → New Query → নিচের কোড paste করুন → Run</p>
          <div className="relative">
            <pre className="text-[10px] font-mono text-slate-400 bg-navy-900 rounded-xl p-3 overflow-x-auto border border-white/5">
              {SQL}
            </pre>
            <button
              onClick={() => { navigator.clipboard?.writeText(SQL) }}
              className="absolute top-2 right-2 glass rounded-lg p-1.5 text-slate-500 active:text-gold-400"
            >
              <Copy size={12} />
            </button>
          </div>
        </Step>

        <Step n="৩" title="API Key কপি করুন">
          <p className="bangla text-sm text-slate-400">Settings → API → Project URL ও anon/public key কপি করুন</p>
        </Step>

        <Step n="৪" title="নিচে paste করুন">
          <div className="space-y-2 mt-2">
            <input
              type="url"
              placeholder="https://xxxx.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input-field text-sm"
            />
            <input
              type="text"
              placeholder="eyJ... (anon public key)"
              value={key}
              onChange={e => setKey(e.target.value)}
              className="input-field text-sm font-mono"
            />
          </div>
        </Step>
      </div>

      <button
        onClick={handleSave}
        disabled={saved || !url || !key}
        className="w-full btn-primary py-4 bangla text-base flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {saved ? <><CheckCircle size={18} /> সংরক্ষিত! লোড হচ্ছে...</> : 'সংরক্ষণ করুন ও শুরু করুন'}
      </button>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl gold-gradient flex items-center justify-center text-navy-900 font-bold text-sm flex-shrink-0 bangla">
          {n}
        </div>
        <h3 className="bangla font-semibold text-white text-sm">{title}</h3>
      </div>
      <div className="pl-10">{children}</div>
    </div>
  )
}
