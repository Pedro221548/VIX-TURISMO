import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, IdCard } from 'lucide-react';

const About: React.FC = () => {
  return (
    <>
      {/* Guide Safety Banner */}
      <section className="bg-orange-600 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-white text-center md:text-left">
          <div className="p-3 bg-white/20 rounded-full">
            <IdCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Viagem Segura com Guia Credenciado</h3>
            <p className="text-orange-100 text-sm">Sua segurança é nossa prioridade. Todos os nossos roteiros são acompanhados por guias profissionais registrados no CADASTUR.</p>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30" />
              
              <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">
                Por que nos escolher
              </span>
              <h2 className="text-5xl md:text-7xl font-display font-black text-stone-900 tracking-tighter leading-[0.9] mb-10 uppercase">
                Excelência em <br />
                <span className="text-orange-600">Turismo Receptivo</span>
              </h2>
              <p className="text-stone-500 text-lg mb-12 leading-relaxed max-w-lg">
                Somos especialistas em criar experiências memoráveis no Espírito Santo, unindo conhecimento local, conforto e total segurança para você e sua família.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="group">
                  <div className="w-14 h-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors duration-500 shadow-xl shadow-black/10">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="font-display font-black text-stone-900 uppercase text-sm tracking-widest mb-3">Segurança Total</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">Seguro passageiro e veículos rigorosamente inspecionados.</p>
                </div>
                <div className="group">
                  <div className="w-14 h-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors duration-500 shadow-xl shadow-black/10">
                    <IdCard className="w-7 h-7" />
                  </div>
                  <h4 className="font-display font-black text-stone-900 uppercase text-sm tracking-widest mb-3">Guias Experts</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">Profissionais credenciados com profundo conhecimento histórico.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="rounded-[2.5rem] overflow-hidden aspect-[3/4] shadow-2xl"
                >
                  <img src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80" alt="ES" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </motion.div>
                <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white aspect-square flex flex-col justify-end">
                  <span className="text-4xl font-black mb-2">10+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Anos de Experiência</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white aspect-square flex flex-col justify-end">
                  <span className="text-4xl font-black mb-2">5k+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Clientes Felizes</span>
                </div>
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="rounded-[2.5rem] overflow-hidden aspect-[3/4] shadow-2xl"
                >
                  <img src="https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&q=80" alt="ES" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default React.memo(About);
