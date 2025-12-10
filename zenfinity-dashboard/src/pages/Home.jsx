import { Link } from 'react-router-dom';
import { ALLOWED_IMEIS } from '../services/api';
import { Battery } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-slate-50 text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white transition-colors">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <p className="text-sky-600 font-semibold text-sm uppercase dark:text-sky-300">Zenfinity Battery Cloud</p>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">Deep insights for every battery cycle</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Select an IMEI to explore temperature distributions, state-of-charge trends, safety events, and
            performance KPIs pulled directly from the latest snapshots API response.
          </p>
          <div className="grid gap-3">
            {ALLOWED_IMEIS.map((imei) => (
              <Link 
                key={imei}
                to={`/dashboard/${imei}`}
                className="group flex items-center justify-between p-4 rounded-2xl border bg-white shadow-sm text-slate-900 border-slate-200 hover:border-sky-400/60 transition-all dark:bg-slate-900 dark:text-white dark:border-slate-800 dark:hover:border-sky-400/60"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500/10 text-sky-600 p-3 rounded-full dark:text-sky-300">
                    <Battery />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Battery IMEI</p>
                    <p className="font-mono text-lg text-slate-900 dark:text-white">{imei}</p>
                  </div>
                </div>
                <span className="text-sky-600 dark:text-sky-300 text-sm group-hover:translate-x-1 transition-transform">Open →</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="p-8 rounded-3xl border bg-white shadow-lg text-slate-900 border-slate-200 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-4">What you&apos;ll see</h3>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300">
              <li>• Cycle navigation with durations and temperatures</li>
              <li>• Temperature distribution chart with 5°–20° bins</li>
              <li>• SOC, SOH, voltage and current health metrics</li>
              <li>• Safety warnings/protections and performance stats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;