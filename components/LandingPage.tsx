
import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Ruler, Sparkles, BookOpen, Download, ShieldCheck } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6 leading-tight">
                Master the Art of <span className="text-indigo-600">Pattern Making</span> with AI
              </h1>
              <p className="text-xl text-gray-500 mb-10 max-w-lg">
                The ultimate companion for fashion design students and tailoring apprentices. Start drafting manually or generate AI patterns in seconds.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/auth" className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg">
                  Get Started Free
                </Link>
                <a href="#features" className="flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:text-lg">
                  Learn More
                </a>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 relative">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <img className="w-full rounded-lg" src="https://picsum.photos/seed/fashion/800/1000" alt="Sewing pattern demo" />
                <div className="absolute inset-0 bg-indigo-500 mix-blend-multiply opacity-10 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to create stunning patterns
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Digital Workspace', desc: 'A dedicated canvas with grid backgrounds for manual pattern drafting.', icon: Scissors },
              { title: 'AI Assistant', desc: 'Upload a garment image and get measurement-based pattern guidance instantly.', icon: Sparkles },
              { title: 'Free Guides', desc: 'Step-by-step tutorials for basic skirts, blouses, and dresses.', icon: BookOpen },
              { title: 'PDF Export', desc: 'Download your creations as high-quality PDF patterns ready for print.', icon: Download },
              { title: 'Precise Tools', desc: 'Line, curve, and label tools designed specifically for pattern markers.', icon: Ruler },
              { title: 'Student Friendly', desc: 'Affordable and accessible tools for students in Ghana and worldwide.', icon: ShieldCheck },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Designed for Education
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Whether you are in your first year of fashion school or starting your own tailoring business, Mashal Patterns bridges the gap between traditional paper drafting and modern technology.
            </p>
            <ul className="space-y-4">
              {['Learn manual calculations first', 'Visualize patterns before cutting fabric', 'Reduce fabric waste with smart layouts'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                  <p className="ml-3 text-base text-gray-700">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-12 lg:mt-0 lg:w-1/2 lg:pl-16">
             <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl">
                <blockquote className="text-xl font-medium italic mb-6">
                  "Mashal Patterns has completely changed how I teach pattern drafting. My students find the manual workspace intuitive and the AI guidance is a fantastic learning aid."
                </blockquote>
                <div className="flex items-center">
                  <img className="h-12 w-12 rounded-full border-2 border-white" src="https://picsum.photos/seed/person1/100/100" alt="Testimonial" />
                  <div className="ml-4">
                    <p className="font-bold">Ama Serwaa</p>
                    <p className="text-indigo-200">Fashion Educator, Accra</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
