import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Users, PlusCircle, Upload, GraduationCap } from 'lucide-react'

const NAV = [
  { to: '/',        icon: Home,         label: 'হোম'      },
  { to: '/students',icon: Users,        label: 'ছাত্রছাত্রী' },
  { to: '/add',     icon: PlusCircle,   label: 'যোগ করুন' },
  { to: '/upload',  icon: Upload,       label: 'আপলোড'   },
]

export default function Layout() {
  const loc = useLocation()
  const isMarksheet = loc.pathname.startsWith('/marksheet')

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-40 safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/30 flex-shrink-0">
            <GraduationCap size={18} className="text-navy-900" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-gold-400 leading-none bangla">
              গোল্ডেন লাইফ পাবলিক স্কুল
            </h1>
            <p className="text-[10px] text-slate-500 bangla">রেজাল্ট ম্যানেজমেন্ট সিস্টেম</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      {!isMarksheet && (
        <nav className="glass-dark fixed bottom-0 left-0 right-0 z-40 safe-bottom border-t border-white/5">
          <div className="flex justify-around px-2 pt-2 pb-1">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-item ${isActive
                    ? 'text-gold-400 bg-gold-500/10'
                    : 'text-slate-500 hover:text-slate-300'}`
                }
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium bangla">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
