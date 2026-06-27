import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, Copy, Check, ArrowRight } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ThankYouState {
  token?: string;
  name?: string;
}

export function ThankYou() {
  const location = useLocation();
  const state = (location.state as ThankYouState) || {};
  const [copied, setCopied] = useState(false);

  if (!state.token) {
    return <Navigate to="/" replace />;
  }

  const trackUrl = `${window.location.origin}/booking/${state.token}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(trackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked; link is shown below regardless */
    }
  }

  return (
    <>
      <Seo title="Booking request received" path="/thank-you" noindex />

      <section className="section">
        <div className="container-page max-w-2xl text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-6 text-3xl font-bold">
            Thanks{state.name ? `, ${state.name}` : ''} — your request is in!
          </h1>
          <p className="mt-3 text-slate-600">
            Our team will review your details and confirm your quote shortly by email or
            phone. Save the link below to track your booking and view your after-service
            report.
          </p>

          <Card className="mt-8 text-left">
            <CardBody>
              <p className="text-sm font-medium text-slate-700">Your private tracking link</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  {trackUrl}
                </code>
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={`/booking/${state.token}`}>
              <Button>
                Track my booking <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
