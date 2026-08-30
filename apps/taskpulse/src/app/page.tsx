import Link from 'next/link';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Smart Organization',
    description: 'Categorize and prioritize tasks with ease. Keep everything structured and accessible at a glance.',
    gradient: 'from-primary-500/20 to-primary-600/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Real-time Collaboration',
    description: 'Work seamlessly with your team. Share tasks, assign roles, and track progress together.',
    gradient: 'from-secondary-500/20 to-secondary-600/5',
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    border: 'hover:border-secondary/30',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analytics & Insights',
    description: 'Gain valuable insights into your productivity with detailed statistics and completion reports.',
    gradient: 'from-accent-500/20 to-accent-600/5',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    border: 'hover:border-accent/30',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Built for speed. Every interaction is instant, keeping you in your flow without delays.',
    gradient: 'from-success-500/20 to-success-600/5',
    iconBg: 'bg-success-500/10',
    iconColor: 'text-success-600',
    border: 'hover:border-success-400/30',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure by Default',
    description: 'Enterprise-grade security protects your data. End-to-end encryption and role-based access.',
    gradient: 'from-warning-500/20 to-warning-600/5',
    iconBg: 'bg-warning-500/10',
    iconColor: 'text-warning-600',
    border: 'hover:border-warning-400/30',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: 'Customizable Views',
    description: 'Board, list, calendar, or timeline — pick the view that works for your workflow.',
    gradient: 'from-danger-500/20 to-danger-600/5',
    iconBg: 'bg-danger-500/10',
    iconColor: 'text-danger-600',
    border: 'hover:border-danger-400/30',
  },
];

const stats = [
  { value: '10k+', label: 'Active teams' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '2M+', label: 'Tasks shipped' },
  { value: '<50ms', label: 'Avg response' },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-surface-950 px-6 pb-16 sm:px-10 sm:pb-24 lg:px-14">
          {/* Decorative mesh grid */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="hero-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#hero-grid)" />
            </svg>
          </div>

          {/* Glow orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-500/20 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary-500/15 blur-[80px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent-500/10 blur-[60px] pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/85 text-xs font-semibold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
              Now in public beta
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Your tasks, your team,{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-accent-400 to-orange-300">
                  fully in sync
                </span>
              </span>
            </h1>

            <p className="text-base sm:text-xl text-primary-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              TaskPulse brings clarity to chaos. Plan sprints, track bugs, and ship features faster
              with a tool that adapts to how you work — not the other way around.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-900 font-bold rounded-xl hover:bg-primary-50 transition-all shadow-[0_4px_24px_0_rgb(0_0_0_/_0.2)] hover:shadow-[0_8px_32px_0_rgb(0_0_0_/_0.3)] text-sm"
              >
                Open Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/tasks"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/15 transition-all text-sm"
              >
                Browse Tasks
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="relative mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-primary-200/70 mt-0.5 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-base sm:text-lg text-surface-500 max-w-2xl mx-auto">
              From personal todos to team sprints, TaskPulse has the tools to get things done.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group relative p-6 bg-white rounded-2xl border border-surface-200 ${feature.border} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-12 h-12 ${feature.iconBg} ${feature.iconColor} rounded-xl flex items-center justify-center mb-5`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-surface-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950 px-6 py-14 sm:px-10 sm:py-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                Ready to streamline your workflow?
              </h2>
              <p className="text-base sm:text-lg text-surface-400 mb-8 leading-relaxed">
                Join teams who ship faster with TaskPulse. Set up your workspace in under a minute.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-[0_4px_20px_0_rgb(59_141_255_/_0.35)] hover:shadow-[0_8px_30px_0_rgb(59_141_255_/_0.5)] text-sm"
              >
                Get Started Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
