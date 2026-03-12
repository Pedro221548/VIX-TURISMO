import React from 'react';
import { motion } from 'motion/react';

interface GalleryProps {
  gallery: any[];
}

const Gallery: React.FC<GalleryProps> = ({ gallery }) => {
  return (
    <section id="galeria" className="py-32 px-6 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">
              Nossos Registros
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-stone-900 tracking-tighter leading-[0.9] uppercase">
              Momentos <br />
              <span className="text-orange-600">Inesquecíveis</span>
            </h2>
          </div>
          <p className="text-stone-500 text-lg max-w-sm leading-relaxed">
            Confira alguns dos registros feitos durante nossos roteiros exclusivos pelo paraíso capixaba.
          </p>
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {gallery.map((item, index) => (
            <motion.div
              key={item.id || `gallery-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 }}
              className="relative group rounded-[2rem] overflow-hidden shadow-xl"
            >
              <img 
                src={item.url} 
                alt={item.title || "Momento City Tour ES"} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-xs font-bold uppercase tracking-widest">{item.title || "City Tour ES"}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Gallery);
