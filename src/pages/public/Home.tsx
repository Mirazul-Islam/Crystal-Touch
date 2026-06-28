import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Star,
  ClipboardCheck,
  CalendarCheck,
  UserCheck,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Seo } from '../../components/Seo';
import { BookingForm } from '../../features/booking/BookingForm';
import { BeforeAfterReveal } from '../../features/showcase/BeforeAfterReveal';
import { Card, CardBody } from '../../components/ui/Card';
import { SERVICE_OPTIONS } from '../../lib/constants';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CleaningService',
  name: 'Crystal Touch Cleaning',
  description:
    'Professional cleaning services for homes, apartments, Airbnbs, hotels and offices with detailed after-service reports.',
  image: 'https://crystaltouch.example.com/og-image.png',
  url: 'https://crystaltouch.example.com/',
  telephone: '+1-000-000-0000',
  priceRange: '$$',
  areaServed: 'Local metro area',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '320',
  },
};

const HOW_IT_WORKS = [
  {
    icon: CalendarCheck,
    title: 'Request a quote',
    text: 'Tell us what needs cleaning and when. It takes about a minute — no payment up front.',
  },
  {
    icon: UserCheck,
    title: 'We dispatch a cleaner',
    text: 'Our team confirms your quote and assigns a vetted, insured cleaner to your job.',
  },
  {
    icon: Sparkles,
    title: 'Enjoy a spotless space',
    text: 'Your cleaner arrives on schedule and gets your place sparkling — every corner covered.',
  },
  {
    icon: FileText,
    title: 'Get your report',
    text: 'After the visit you receive a detailed report with photos, so you know exactly what was done.',
  },
];

const WHY_US = [
  {
    icon: ShieldCheck,
    title: 'Vetted & insured',
    text: 'Every cleaner is background-checked, trained, and fully insured for your peace of mind.',
  },
  {
    icon: ClipboardCheck,
    title: 'Detailed reports',
    text: 'Photo-backed after-service reports on every job — full transparency, no surprises.',
  },
  {
    icon: Clock,
    title: 'On your schedule',
    text: 'One-time, weekly, bi-weekly or monthly. Book around your life, not ours.',
  },
  {
    icon: Star,
    title: 'Satisfaction first',
    text: 'Not happy with something? Tell us and we’ll make it right, fast.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The report with before-and-after photos is a game changer for managing my Airbnb turnovers. I always know the place is guest-ready.',
    name: 'Maya R.',
    role: 'Airbnb host',
  },
  {
    quote:
      'Reliable, thorough, and friendly. Our office has never looked better and scheduling is effortless.',
    name: 'Daniel K.',
    role: 'Office manager',
  },
  {
    quote:
      'Booked in a minute and a cleaner was at my door two days later. Spotless home and a lovely team.',
    name: 'Priya S.',
    role: 'Homeowner',
  },
];

export function Home() {
  return (
    <>
      <Seo
        title="Crystal Touch Cleaning | Professional Home, Airbnb & Commercial Cleaning"
        description="Book trusted, professional cleaners for your home, apartment, Airbnb, hotel or office. Transparent quotes and a detailed after-service report on every job."
        path="/"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="container-page relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-current" /> Rated 4.9/5 by 320+ clients
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Spotless homes & spaces, with a report you can trust
            </h1>
            <p className="mt-5 max-w-lg text-lg text-brand-50">
              Professional cleaning for homes, apartments, Airbnbs, hotels and offices.
              Vetted, insured cleaners and a photo-backed report after every visit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#book"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
              >
                Get a free quote <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Explore services
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-50">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Insured & background-checked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Same-week availability
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center md:mt-0">
            <BeforeAfterReveal className="w-full max-w-xl" />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Cleaning services for every space</h2>
            <p className="mt-3 text-slate-600">
              From a quick apartment refresh to full hotel and post-construction cleans,
              Crystal Touch has a trained team for the job.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_OPTIONS.map((s) => (
              <Card key={s.value} className="transition hover:shadow-md">
                <CardBody>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{s.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.blurb}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-slate-600">
              Booking a professional clean has never been simpler.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-bold text-brand-600">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Why clients choose Crystal Touch</h2>
            <p className="mt-3 text-slate-600">
              We pair dependable, friendly cleaners with the transparency of a detailed
              report on every single job — something most cleaning companies simply don’t
              offer.
            </p>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              {WHY_US.map((w) => (
                <div key={w.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <w.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <dt className="font-semibold text-slate-900">{w.title}</dt>
                    <dd className="mt-0.5 text-sm text-slate-600">{w.text}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-4">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name}>
                <CardBody>
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 text-slate-700">“{t.quote}”</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {t.name}{' '}
                    <span className="font-normal text-slate-500">· {t.role}</span>
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="section scroll-mt-16 bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Request your free quote</h2>
            <p className="mt-3 text-slate-600">
              Fill in a few details and our team will confirm your quote and dispatch a
              cleaner. No account needed.
            </p>
          </div>
          <Card className="mx-auto mt-10 max-w-4xl">
            <CardBody className="md:p-8">
              <BookingForm />
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  );
}
