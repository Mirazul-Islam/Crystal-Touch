import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { SERVICE_OPTIONS } from '../../lib/constants';

const DETAILS: Record<string, string> = {
  house:
    'Regular and deep cleaning for houses of any size — kitchens, bathrooms, bedrooms, living areas, floors and surfaces left fresh and spotless.',
  apartment:
    'Efficient, thorough cleaning tailored to apartments and condos, including shared-building considerations and compact spaces.',
  airbnb:
    'Fast, reliable turnover cleaning between guests with linen changes, restocking checks and a photo report so your listing stays five-star.',
  hotel:
    'Scalable housekeeping for guest rooms, suites and common areas, delivered to consistent, inspection-ready standards.',
  office:
    'Commercial cleaning for offices and workspaces — desks, kitchens, restrooms and high-traffic areas kept hygienic and presentable.',
  move_in_out:
    'Detailed top-to-bottom cleaning for empty properties so tenants move in (or out) to an immaculate space and deposits stay protected.',
  post_construction:
    'Dust, debris and residue removal after renovations or builds, making new and remodelled spaces truly move-in ready.',
  deep_clean:
    'An intensive, one-off reset that reaches the spots routine cleans miss — appliances, grout, baseboards, vents and more.',
};

export function Services() {
  return (
    <>
      <Seo
        title="Cleaning Services — Homes, Airbnb, Hotels & Offices"
        description="Explore Crystal Touch cleaning services: house & apartment cleaning, Airbnb turnovers, hotel housekeeping, office cleaning, move-in/out, post-construction and deep cleans."
        path="/services"
      />

      <section className="bg-gradient-to-br from-brand-700 to-brand-500 py-16 text-white">
        <div className="container-page max-w-3xl">
          <h1 className="text-4xl font-extrabold text-white">Our cleaning services</h1>
          <p className="mt-4 text-lg text-brand-50">
            Whatever the space, we have a trained, insured team ready — and every job ends
            with a detailed, photo-backed report.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {SERVICE_OPTIONS.map((s) => (
            <Card key={s.value}>
              <CardBody className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <s.icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{s.label} cleaning</h2>
                  <p className="mt-2 text-slate-600">{DETAILS[s.value]}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="container-page mt-12 text-center">
          <Link
            to="/#book"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Request a free quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
