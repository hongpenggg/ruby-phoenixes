import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold text-red-700">404</p>
        <h1 className="text-3xl font-bold text-neutral-900">Page not found</h1>
        <p className="text-neutral-600">The page you’re looking for doesn’t exist.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
