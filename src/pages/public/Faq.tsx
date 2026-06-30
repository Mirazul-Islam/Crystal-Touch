import { Seo } from '../../components/Seo';

const FAQS = [
  {
    q: 'Do I need to create an account to book?',
    a: 'No. Just fill in the quote request on our home page with your contact and property details. We’ll confirm your quote and dispatch a cleaner. You’ll get a private link to track your booking and view the report.',
  },
  {
    q: 'What areas and property types do you cover?',
    a: 'We clean houses, apartments and condos, and Airbnb / short-stay rentals — including fast same-day Airbnb Express turnarounds between guests.',
  },
  {
    q: 'Are your cleaners insured and background-checked?',
    a: 'Yes. Every cleaner on our team is vetted, background-checked, trained and fully insured.',
  },
  {
    q: 'What is the after-service report?',
    a: 'When your cleaner finishes, they submit a report with a summary, a checklist of what was done, and before/after photos. You and our admin team can both view it from your booking link.',
  },
  {
    q: 'How do I pay?',
    a: 'There’s no payment when you request a quote. We confirm pricing first, then arrange payment — so there are no surprises.',
  },
  {
    q: 'Can I book recurring cleans?',
    a: 'Absolutely. Choose weekly, bi-weekly or monthly when you request your quote, and we’ll set up a regular schedule with a consistent cleaner where possible.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export function Faq() {
  return (
    <>
      <Seo
        title="Frequently Asked Questions"
        description="Answers about booking, pricing, service areas, insured cleaners and the after-service report from Crystal Touch Cleaning."
        path="/faq"
        jsonLd={jsonLd}
      />

      <section className="section">
        <div className="container-page max-w-3xl">
          <h1 className="text-4xl font-extrabold">Frequently asked questions</h1>
          <p className="mt-3 text-slate-600">
            Everything you need to know about booking a clean with Crystal Touch.
          </p>

          <div className="mt-10 divide-y divide-slate-200">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-slate-900">
                  {f.q}
                  <span className="ml-4 text-brand-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
