import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';

export function NotFound() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <section className="section">
        <div className="container-page max-w-xl text-center">
          <p className="text-6xl font-extrabold text-brand-600">404</p>
          <h1 className="mt-4 text-2xl font-bold">We couldn’t find that page</h1>
          <p className="mt-2 text-slate-600">
            The page you’re looking for may have moved or no longer exists.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <Button>Back to home</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
