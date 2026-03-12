import React from 'react';
import { Instagram, Facebook, Twitter, MapPin, MessageCircle, Heart } from 'lucide-react';

interface FooterProps {
  contactInfo: any;
}

const Footer: React.FC<FooterProps> = ({ contactInfo }) => {
  return (
    <footer className="bg-stone-950 text-white py-24 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.imgur.com/3hNeKBx.png" 
                alt="Logo" 
                className="h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <span className="font-display font-black text-xl tracking-tight">VIX ES TURISMO</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed">
              Especialistas em turismo receptivo no Espírito Santo. Criamos experiências únicas com conforto, segurança e exclusividade.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Instagram, href: contactInfo.instagram },
                { icon: Facebook, href: contactInfo.facebook },
                { icon: Twitter, href: contactInfo.twitter }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-orange-600 transition-all duration-500"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-black uppercase text-xs tracking-[0.3em] text-orange-500 mb-8">Navegação</h4>
            <ul className="space-y-4">
              {['Roteiros', 'Frota', 'Galeria', 'Sobre Nós'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-stone-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-black uppercase text-xs tracking-[0.3em] text-orange-500 mb-8">Contato</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-stone-400 text-sm leading-relaxed">Vitória, Espírito Santo - Brasil</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-stone-400 text-sm leading-relaxed">{contactInfo.phone}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-black uppercase text-xs tracking-[0.3em] text-orange-500 mb-8">Newsletter</h4>
            <p className="text-stone-500 text-sm mb-6">Receba novidades e promoções exclusivas.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Seu e-mail"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-orange-600 text-white px-4 rounded-lg hover:bg-orange-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-stone-600 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} VIX ES TURISMO. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-stone-600 text-xs font-bold uppercase tracking-widest">
            Feito com <Heart className="w-3 h-3 text-orange-600 fill-orange-600" /> no Espírito Santo
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
