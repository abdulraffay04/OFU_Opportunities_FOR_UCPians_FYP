import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  BriefcaseIcon, AcademicCapIcon, CodeBracketIcon,
  UserGroupIcon, DocumentTextIcon, ChatBubbleLeftRightIcon,
  ChartBarIcon, RocketLaunchIcon, SparklesIcon, TrophyIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const features = [
  { title: 'Jobs & Internships', description: 'Access verified placements from top-tier industry partners.', icon: BriefcaseIcon },
  { title: 'Scholarship Portal', description: 'Streamlined discovery of institutional and external funding.', icon: AcademicCapIcon },
  { title: 'Freelance Marketplace', description: 'Project-based work to bridge the gap to professional practice.', icon: CodeBracketIcon },
  { title: 'Alumni Network', description: 'Leverage the UCP graduate directory for mentorship.', icon: UserGroupIcon },
  { title: 'AI Resume Analyzer', description: 'Data-driven insights to optimize your CV for ATS systems.', icon: DocumentTextIcon },
  { title: 'Career Counselor', description: 'Personalized strategic planning for long-term career growth.', icon: ChatBubbleLeftRightIcon }
];

const stats = [["10K+", "Active Students"], ["500+", "Partners"], ["2K+", "Opportunities"], ["300+", "Mentors"]];

const pathways = ['Software Engineering', 'Business Management', 'Legal Studies', 'Health Sciences'];

const aiCapabilities = [
  { t: "Resume Intelligence", i: DocumentTextIcon },
  { t: "Career Strategy", i: RocketLaunchIcon },
  { t: "Skill Gap Metrics", i: ChartBarIcon },
  { t: "Precision Matching", i: SparklesIcon }
];

/* ---------- motion variants ---------- */

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const heroItem = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const gridItem = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

/* ---------- animated counter ---------- */

function Counter({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '');
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 20, stiffness: 60 });
  const display = useRef(null);

  useEffect(() => {
    if (inView) motionVal.set(numeric);
  }, [inView]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (display.current) display.current.textContent = Math.floor(v) + suffix;
    });
  }, [spring]);

  return <span ref={ref}><span ref={display}>0{suffix}</span></span>;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center text-white font-black text-sm">O</div>
            <span className="font-black text-xl tracking-tight">OFU Portal</span>
          </motion.div>

          <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {['Overview', 'Services', 'Partners', 'Contact'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                className="relative group py-2"
              >
                {item}
                <span className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-indigo-800 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-indigo-800 text-white px-6 py-2.5 text-[11px] font-bold hover:bg-slate-900 transition-all"
            >
              Access Portal
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative py-32 px-6 border-b border-slate-100 bg-slate-50 overflow-hidden">

        {/* ambient floating shapes */}
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-slate-200/50 blur-3xl"
          animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.span
            variants={heroItem}
            className="inline-block py-1 px-3 mb-6 bg-indigo-100 text-indigo-800 font-bold text-[10px] uppercase tracking-widest rounded"
          >
            The Official UCP Career Ecosystem
          </motion.span>

          <motion.h1
            variants={heroItem}
            className="text-6xl md:text-9xl font-black tracking-tighter mb-8 text-slate-950 leading-[0.9]"
          >
            Empowering{' '}
            <motion.span
              className="inline-block text-indigo-800"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              UCP Success
            </motion.span>
          </motion.h1>

          <motion.p variants={heroItem} className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            An enterprise-grade platform designed to align academic talent with industry demand. Secure your professional future with verified data and intelligent career tools.
          </motion.p>

          <motion.div variants={heroItem} className="flex gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-5 font-bold text-sm hover:bg-indigo-800 transition-all shadow-xl"
              >
                Get Started
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(([v, l], i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <h3 className="text-4xl font-black text-slate-950">
                <Counter value={v} />
              </h3>
              <p className="mt-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SERVICES GRID */}
      <section id="services" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-12"
          >
            Core Capabilities
          </motion.h2>

          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={gridItem}
                whileHover={{ backgroundColor: '#ffffff', y: -4 }}
                className="p-10 border-r border-b border-slate-200 transition-colors"
              >
                <motion.div whileHover={{ rotate: -8, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <f.icon className="w-8 h-8 text-indigo-800 mb-6" />
                </motion.div>
                <h3 className="text-md font-black text-slate-950 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PATHWAYS */}
      <section id="categories" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black mb-16 text-center"
          >
            Academic Pathways
          </motion.h2>

          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {pathways.map((p) => (
              <motion.div
                key={p}
                variants={gridItem}
                whileHover={{ y: -6, borderColor: '#3730a3' }}
                className="p-8 border border-slate-200 transition-all text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="inline-block"
                >
                  <TrophyIcon className="w-8 h-8 text-indigo-800 mx-auto mb-4" />
                </motion.div>
                <h3 className="font-black text-sm">{p}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI CAPABILITIES */}
      <section id="ai" className="relative py-24 bg-slate-900 text-white overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute top-0 right-0 w-[32rem] h-[32rem] rounded-full bg-indigo-600/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black mb-16"
          >
            AI-Driven Insights
          </motion.h2>

          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid md:grid-cols-4 gap-6"
          >
            {aiCapabilities.map((item, i) => (
              <motion.div
                key={i}
                variants={gridItem}
                whileHover={{ y: -4, borderColor: '#818cf8' }}
                className="p-8 border border-slate-800 transition-colors"
              >
                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <item.i className="w-8 h-8 text-indigo-400 mb-6" />
                </motion.div>
                <h3 className="font-bold text-sm">{item.t}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <motion.footer
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 px-6 text-center border-t border-slate-200"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">© 2026 UCP Career Placement Office. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}

export default LandingPage;