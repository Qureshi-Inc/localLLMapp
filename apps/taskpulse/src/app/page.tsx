import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
        Manage Tasks <span className="text-indigo-600">Effortlessly</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-10">
        TaskPulse helps you organize, track, and complete your work with a modern, intuitive interface designed for productivity.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/dashboard" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg">
          Go to Dashboard
        </Link>
        <Link href="/tasks" className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-50 transition">
          View Tasks
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {[
          { title: 'Smart Organization', desc: 'Categorize and prioritize tasks with ease using our intuitive drag-and-drop interface.' },
          { title: 'Real-time Collaboration', desc: 'Work seamlessly with your team. Share tasks, assign roles, and track progress together.' },
          { title: 'Analytics & Insights', desc: 'Gain valuable insights into your productivity with detailed statistics and completion reports.' },
        ].map((feature, i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}