import Link from 'next/link';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Smart Organization',
    description: 'Categorize and prioritize tasks with ease using our intuitive drag-and-drop interface. Keep everything structured and accessible.',
    bgClass: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Real-time Collaboration',
    description: 'Work seamlessly with your team. Share tasks, assign roles, and track progress together in real-time.',
    bgClass: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analytics & Insights',
    description: 'Gain valuable insights into your productivity with detailed statistics and completion reports.',
    bgClass: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Built for speed. Every interaction is instant, keeping you in your flow without interruptions or delays.',
    bgClass: 'bg-success/10',
    iconColor: 'text-success-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure by Default',
    description: 'Enterprise-grade security protects your data. End-to-end encryption and role-based access keep things safe.',
    bgClass: 'bg-warning/10',
    iconColor: 'text-warning-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: 'Customizable Views',
    description: 'Board, list, calendar, or timeline — pick the view that works best for your workflow and switch anytime.',
    bgClass: 'bg-danger/10',
    iconColor: 'text-danger-600',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="w-full">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-600 to-primary-900 px-6 py-16 sm:px-8 sm:py-24 lg:px-12">
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
            <div className="relative max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
                Now in public beta
              </div>
              <h1 className="text-3xl sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight font-bold text-white tracking-tight mb-6">
                Your tasks, your team,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">
                  fully in sync
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                TaskPulse brings clarity to chaos. Plan sprints, track bugs, and ship features faster
                with a tool that adapts to how you work.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-primary-900 font-semibold rounded-lg hover:bg-surface-50 transition shadow-lg hover:shadow-xl text-center"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition text-center"
                >
                  Browse Tasks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 tracking-tight mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-base sm:text-lg text-surface-500 max-w-2xl mx-auto">
              From personal todos to team sprints, TaskPulse has the tools you need to get things done.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 bg-white rounded-xl border border-surface-200 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.bgClass} ${feature.iconColor} rounded-lg flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 px-6 py-14 sm:px-8 sm:py-20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
            <div className="relative max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                Ready to streamline your workflow?
              </h2>
              <p className="text-base sm:text-lg text-surface-400 mb-8 leading-relaxed">
                Join teams who ship faster with TaskPulse. Set up your workspace in under a minute.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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