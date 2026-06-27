import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from './Logo';
import { Button } from '../ui/Button';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/faq', label: 'FAQ' },
];

function PublicNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium transition hover:text-brand-600',
                  isActive ? 'text-brand-600' : 'text-slate-600',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-brand-600">
            Staff login
          </Link>
          <Button size="sm" onClick={() => navigate('/#book')}>
            Book now
          </Button>
        </div>

        <button
          className="rounded-md p-2 text-slate-600 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Staff login
            </Link>
            <Button
              className="mt-2"
              onClick={() => {
                setOpen(false);
                navigate('/#book');
              }}
            >
              Book now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            Professional, fully-insured cleaning for homes, Airbnbs, hotels and
            offices. Trusted cleaners, transparent pricing, and a detailed report
            after every visit.
          </p>
          <a
            href="tel:+10000000000"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-300 hover:text-brand-200"
          >
            <Phone className="h-4 w-4" /> (000) 000-0000
          </a>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/#book" className="hover:text-white">Book a clean</Link></li>
            <li><Link to="/login" className="hover:text-white">Staff login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Service areas</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>Residential &amp; apartments</li>
            <li>Airbnb &amp; short-stay turnovers</li>
            <li>Hotels &amp; commercial offices</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="container-page py-5 text-xs text-slate-500">
          © {new Date().getFullYear()} Crystal Touch Cleaning. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
