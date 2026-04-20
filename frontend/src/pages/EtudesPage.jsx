import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Globe } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CSS = `
@keyframes floatAnim {
  0%,100%{transform:translateY(0) rotate(0deg);}
  50%{transform:translateY(-22px) rotate(6deg);}
}
@keyframes fadeUp {
  from{opacity:0;transform:translateY(40px);}
  to{opacity:1;transform:translateY(0);}
}
@keyframes gradShift {
  0%{background-position:0% 50%;}
  50%{background-position:100% 50%;}
  100%{background-position:0% 50%;}
}
.dest-card img{transition:transform 0.7s ease;}
.dest-card:hover img{transform:scale(1.09);}
.dest-card .inner{transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1);}
.dest-card:hover .inner{transform:translateY(-10px);}
.dest-card .overlay{transition:opacity 0.4s;}
.dest-card:hover .overlay{opacity:.55!important;}
`;

const DESTINATIONS = [
  {
    id: 'chine', name: 'Chine', flag: '🇨🇳', tagline: 'La Puissance Asiatique',
    desc: "2ème destination mondiale. Plus de 3 000 universités, 500 000 étudiants étrangers et des frais de scolarité parmi les plus abordables.",
    img: 'https://images.pexels.com/photos/32384116/pexels-photo-32384116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    color: '#dc2626', grad: 'from-red-950/70 via-red-900/50 to-black/90',
    stats: [{ v:'3 000+',l:'Universités' },{ v:'500K',l:'Étudiants intl.' },{ v:'4 000+',l:'Progs EN' },{ v:'~1 500€',l:'Scolarité/an' }],
  },
  {
    id: 'france', name: 'France', flag: '🇫🇷', tagline: "L'Excellence Européenne",
    desc: "3ème destination mondiale. Accès aux Grandes Écoles, universités reconnues et une vie culturelle sans égal en Europe.",
    img: 'https://images.pexels.com/photos/34773160/pexels-photo-34773160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    color: '#1d4ed8', grad: 'from-blue-950/70 via-blue-900/50 to-black/90',
    stats: [{ v:'3 500+',l:'Universités' },{ v:'350K',l:'Étudiants intl.' },{ v:'230+',l:'Grandes Écoles' },{ v:'~3 000€',l:'Scolarité/an' }],
  },
  {
    id: 'canada', name: 'Canada', flag: '🇨🇦', tagline: "La Qualité Nord-Américaine",
    desc: "Système bilingue de classe mondiale. Immigration post-diplôme facilitée, sécurité et qualité de vie exceptionnelles.",
    img: 'https://images.unsplash.com/photo-1601269140247-ede0bbd75c00?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHxDYW5hZGElMjBUb3JvbnRvJTIwdW5pdmVyc2l0eSUyMGNhbXB1cyUyMGF1dHVtbnxlbnwwfHx8fDE3NzY3MTAyNDd8MA&ixlib=rb-4.1.0&q=85',
    color: '#b91c1c', grad: 'from-rose-950/70 via-rose-900/50 to-black/90',
    stats: [{ v:'200+',l:'Universités' },{ v:'800K',l:'Étudiants intl.' },{ v:'2 langues',l:'EN / FR' },{ v:'PGWP',l:'Permis travail' }],
  },
];

export default function EtudesPage() {
  const navigate = useNavigate();
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="min-h-screen bg-[#06090f] overflow-hidden">
        <Header onOpenAuth={() => {}} />

        {/* ── Hero ── */}
        <section className="relative pt-28 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 25% 60%,rgba(59,130,246,.12) 0%,transparent 55%),radial-gradient(ellipse at 75% 20%,rgba(220,38,38,.09) 0%,transparent 50%)' }} />
          {[...Array(10)].map((_,i) => (
            <div key={i} className="absolute rounded-full" style={{
              width:`${22+(i*11)%38}px`, height:`${22+(i*11)%38}px`,
              background:['#dc2626','#1d4ed8','#b91c1c','#f59e0b'][i%4],
              left:`${8+(i*9.1)%84}%`, top:`${8+(i*13.3)%82}%`,
              opacity:.14, filter:'blur(9px)',
              animation:`floatAnim ${4+(i%3)}s ease-in-out infinite`, animationDelay:`${i*.35}s`,
            }} />
          ))}
          <div className="relative text-center max-w-4xl mx-auto" style={{ animation: vis ? 'fadeUp .8s ease forwards' : 'none', opacity: vis ? 1 : 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-white/10 bg-white/5 backdrop-blur-sm">
              <GraduationCap size={15} className="text-blue-400" />
              <span className="text-sm text-gray-400 font-medium">Études Internationales — AccessHub Global</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tight">
              Choisissez votre<br />
              <span className="text-transparent bg-clip-text" style={{
                backgroundImage: 'linear-gradient(120deg,#dc2626,#3b82f6,#b91c1c,#60a5fa)',
                backgroundSize: '250% auto',
                animation: 'gradShift 5s ease infinite',
              }}>destination</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Trois pays. Trois cultures. Un avenir international. Explorez chaque destination et trouvez celle qui correspond à vos ambitions.
            </p>
          </div>
        </section>

        {/* ── Cards ── */}
        <section className="max-w-7xl mx-auto px-4 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {DESTINATIONS.map((d, i) => (
              <div
                key={d.id}
                className="dest-card relative rounded-3xl overflow-hidden cursor-pointer group"
                style={{
                  height: 600,
                  animation: vis ? `fadeUp .8s ease ${.15 + i*.18}s forwards` : 'none',
                  opacity: vis ? 1 : 0,
                  boxShadow: `0 30px 70px ${d.color}25`,
                }}
                onClick={() => navigate(`/etudes/${d.id}`)}
                data-testid={`dest-card-${d.id}`}
              >
                <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`overlay absolute inset-0 bg-gradient-to-t ${d.grad}`} style={{ opacity:.8 }} />
                <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500" />

                <div className="inner absolute inset-0 flex flex-col justify-end p-8">
                  {/* Flag + Name */}
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-6xl leading-none">{d.flag}</span>
                    <div>
                      <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">{d.tagline}</p>
                      <h2 className="text-4xl font-black text-white leading-none">{d.name}</h2>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm leading-relaxed mb-5">{d.desc}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2.5 mb-6">
                    {d.stats.map((s,j) => (
                      <div key={j} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                        <p className="text-white font-bold text-lg leading-none">{s.v}</p>
                        <p className="text-white/55 text-[11px] mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 group-hover:gap-3"
                    style={{ background: d.color, boxShadow: `0 10px 28px ${d.color}45` }}
                  >
                    Découvrir {d.name} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16" style={{ animation: vis ? 'fadeUp .8s ease .65s forwards' : 'none', opacity: vis ? 1 : 0 }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-gray-700" />
              <Globe size={17} className="text-gray-600" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-gray-700" />
            </div>
            <p className="text-gray-600 text-sm">AccessHub Global vous accompagne dans toutes vos démarches d'admission, de visa et d'installation.</p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
