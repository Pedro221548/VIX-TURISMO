/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AdminPanel from './components/AdminPanel';
import { 
  Utensils, 
  MapPin, 
  Camera, 
  Image as ImageIcon,
  ChevronRight, 
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  BookOpen,
  Clock,
  Download,
  Plus,
  Instagram,
  Facebook,
  Twitter,
  IdCard,
  Sparkles
} from 'lucide-react';

const INITIAL_ROTEIROS = [
  {
    title: "Praias de Guarapari",
    subtitle: "ROTEIRO 1",
    price: "450,00",
    timeDeparture: "08:00",
    timeReturn: "16:00",
    images: [
      "https://prefiroguarapari.com.br/wp-content/uploads/2024/08/praia-do-morro-em-guarapari.jpg",
      "https://terracapixaba.com/wp-content/uploads/2023/12/praia-de-peracanga-enseada-azul-guarapari-1-1.webp",
      "https://www.guiaviagensbrasil.com/imagens/foto-praia-castanheiras-guarapari-es.jpg"
    ],
    places: ["Praia de Setiba", "Praia do Morro", "Praia da Areia Preta", "Praia das Castanheiras"],
    courtesy: ["Cadeiras de praia", "Guara Sol", "Caixa Térmica"],
    flyer: "https://storage.googleapis.com/a1aa/image/guarapari_flyer.png",
    history: "Conhecida como a 'Cidade Saúde', Guarapari foi fundada pelo Padre José de Anchieta em 1585. Suas famosas areias monazíticas atraem turistas do mundo todo por suas propriedades terapêuticas.",
    gastronomy: "O Peroá frito com batata, farofa e vinagrete é o clássico das praias, sem esquecer da autêntica Moqueca Capixaba servida nos melhores restaurantes da orla.",
    curiosities: "As areias monazíticas de Guarapari possuem um nível natural de radioatividade que é considerado benéfico para o tratamento de reumatismo e outras inflamações."
  },
  {
    title: "Domingos Martins e Pedra Azul",
    subtitle: "Roteiro 2",
    price: "600,00",
    timeDeparture: "08:00",
    timeReturn: "16:00",
    images: [
      "https://www.correiobraziliense.com.br/aqui/wp-content/uploads/2025/08/1280px-Pedra_Azul_006.jpg",
      "https://th.bing.com/th/id/OIP.AMFkZfcV0hMHbAbBYPdt0QHaE8?w=279&h=186&c=7&r=0&o=7&pid=1.7&rm=3",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/41/21/2d/photo2jpg.jpg?w=1200&h=-1&s=1",
      "https://uploads.folhavitoria.com.br/2025/02/QACT0jNh-FACHADA-KEBIS-BISCOITOS-1536x864.webp",
      "https://tse3.mm.bing.net/th/id/OIP.TreHpZPYn_3Ju_naltGHKAHaE2?rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://th.bing.com/th/id/OIP.txQ4_gmxCLKq6SPLDafatAAAAA?w=239&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
      "https://th.bing.com/th/id/OIP.9YlEMVoGdWK-jxvuKJNewAHaFj?w=257&h=193&c=7&r=0&o=7&pid=1.7&rm=3",
      "https://media-cdn.tripadvisor.com/media/photo-s/0e/a8/1e/0e/frente-da-cervejaria.jpg",
      "https://i.imgur.com/JzgCJM6.jpeg"
    ],
    places: ["Parque da Pedra Azul", "Quadrado de São Paulinho", "Cervejaria Ronchi", "Biscoite Kebis", "Igreja Luterana", "Museu do Colono", "Rua do Laser", "Cervejaria Barba Ruiva", "Portal da Cidade"],
    history: "Colonizada por alemães e italianos, a região mantém viva a cultura europeia. Domingos Martins é um pedaço da Alemanha nas montanhas capixabas, com arquitetura enxaimel e festas tradicionais.",
    gastronomy: "Destaque para o Socol (embutido de origem italiana), queijos finos, cafés especiais premiados e a culinária típica alemã como o joelho de porco.",
    curiosities: "A Pedra Azul, um afloramento de granito de 1.822 metros, possui uma formação que lembra um lagarto subindo a pedra, mudando de cor até 36 vezes por dia conforme a luz."
  },
  {
    title: "Buda Gigante e Santa Teresa",
    subtitle: "Roteiro 3",
    price: "600,00",
    timeDeparture: "08:00",
    timeReturn: "16:00",
    images: [
      "https://www.neosenses.com.br/wp-content/uploads/2021/04/88e258d8-12d9-4857-b339-76bef25163c8.jpg",
      "https://th.bing.com/th/id/OIP.Rki4DjPS_BivGYA1Pc3WqwHaFj?w=247&h=185&c=7&r=0&o=7&pid=1.7&rm=3",
      "https://midias.agazeta.com.br/2019/12/06/a-rua-do-lazer-em-santa-teresa-regiao-serrana-do-espirito-santo-teve-toda-a-fiacao-reinstalada-subterranea-em-obra-de-revitalizacao-142529-article.jpeg",
      "https://midias.gazetaonline.com.br/_midias/jpg/2018/08/10/aba-5731243.jpg",
      "https://th.bing.com/th/id/OIP.YMsKUTXLOof-1nMIEsV_bgHaId?w=147&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
      "https://th.bing.com/th/id/OIP.7DZMaqsXgO05FsM9vlatcAHaHa?w=158&h=180&c=7&r=0&o=7&pid=1.7&rm=3"
    ],
    places: ["Buda Gigante", "Biscoito Claid's", "Museu Melo Leitão", "Vinícola Mattiello", "Cantinas Italianas", "Casa Lambert", "Pepe Chocolate", "Cervejarias Artesanais"],
    history: "Santa Teresa foi a primeira cidade fundada por imigrantes italianos no Brasil em 1874. Já o Mosteiro Zen Morro da Vargem abriga o Grande Buda de Ibiraçu, o segundo maior do mundo.",
    gastronomy: "Famosa por suas cantinas italianas com massas frescas, polenta, vinhos de produção local e licores artesanais que encantam o paladar.",
    curiosities: "Santa Teresa é conhecida como a 'Terra dos Colibris' e foi o lar do naturalista Augusto Ruschi, patrono da ecologia no Brasil."
  },
  {
    title: "Vitória e Vila Velha",
    subtitle: "Roteiro 4",
    price: "450,00",
    timeDeparture: "08:00",
    timeReturn: "16:00",
    images: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/c8/71/f4/photo0jpg.jpg?w=1000&h=-1&s=1",
      "https://clickmuseus.com.br/wp-content/uploads/2021/11/Moldando-a-panela-de-barro-1170x878-2.jpg",
      "https://www.ipatrimonio.org/wp-content/uploads/2018/08/Vit%C3%B3ria-Forte-S%C3%A3o-Jo%C3%A3o-Imagem-SeCult-ES2.jpg",
      "https://i.pinimg.com/736x/36/de/b5/36deb539de90bc4710146c5a6af8cb13.jpg",
      "https://i.ytimg.com/vi/HT5M8tiLJcQ/maxresdefault.jpg",
      "https://th.bing.com/th/id/R.89087f2d63d59fe4120fd6800fe44af8?rik=n293ec%2bomoOR%2bw&riu=http%3a%2f%2fesnoticias.com.br%2fwp-content%2fuploads%2f2017%2f08%2fconvento-da-penha.jpg&ehk=uFcdkXuz9LAaHnUkgsLeuoiKMGgwgotZ0mXNK2NAP70%3d&risl=&pid=ImgRaw&r=0",
      "https://1.bp.blogspot.com/-fnkD_1uRBRg/X15dnLNvV0I/AAAAAAABLUc/rD6b9dMcY4IR6K2izDIQJdYlS8i0yRmlwCLcBGAsYHQ/s16000/cats.jpg"
    ],
    places: ["Enseada do Suá", "Ilha do Frade", "Ilha do Boi", "Paneleiras", "Forte São João", "Catedral Metropolitana", "Palácio do Governo", "Orla Praia da Costa", "Praia Secreta", "Farol de Santa Luzia", "Convento da Penha", "Chocolate Garoto"],
    history: "Vila Velha é a cidade mais antiga do estado, fundada em 1535. O Convento da Penha, erguido em 1558, é um dos santuários marianos mais antigos e importantes do Brasil.",
    gastronomy: "A Torta Capixaba é a estrela, especialmente na Semana Santa. Em Vila Velha, a visita à fábrica de chocolates Garoto é uma experiência doce imperdível.",
    curiosities: "As Paneleiras de Goiabeiras mantêm uma tradição de mais de 400 anos na fabricação de panelas de barro, técnica essencial para a verdadeira Moqueca Capixaba."
  },
  {
    title: "Anchieta e Meaípe",
    subtitle: "Roteiro 5",
    price: "550,00",
    timeDeparture: "08:00",
    timeReturn: "16:00",
    images: [
      "https://terracapixaba.com.br/wp-content/uploads/2023/12/santuario-nacional-de-sao-jose-de-anchieta-anchieta-es-1.webp",
      "https://th.bing.com/th/id/OIP.X4K_X4K_X4K_X4K_X4K_X4K_X4K?w=800&h=600&c=7&r=0&o=7&pid=1.7",
      "https://media-cdn.tripadvisor.com/media/photo-s/0e/a8/1e/0e/frente-da-cervejaria.jpg"
    ],
    places: ["Santuário de Anchieta", "Praia de Castelhanos", "Meaípe", "Enseada Azul"],
    history: "Anchieta abriga o Santuário Nacional de São José de Anchieta, onde o santo viveu seus últimos anos. Meaípe é uma antiga vila de pescadores que se tornou um dos balneários mais famosos do estado.",
    gastronomy: "Meaípe é famosa por sua gastronomia, sendo considerada uma das melhores do Brasil, com destaque para a moqueca e o bolinho de aipim.",
    curiosities: "O Santuário de Anchieta é um dos complexos jesuíticos mais antigos do Brasil, datando do século XVI."
  },
  {
    title: "Venda Nova do Imigrante",
    subtitle: "Roteiro 6",
    price: "650,00",
    timeDeparture: "08:00",
    timeReturn: "16:00",
    images: [
      "https://th.bing.com/th/id/OIP.TreHpZPYn_3Ju_naltGHKAHaE2?rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://uploads.folhavitoria.com.br/2025/02/QACT0jNh-FACHADA-KEBIS-BISCOITOS-1536x864.webp",
      "https://th.bing.com/th/id/OIP.txQ4_gmxCLKq6SPLDafatAAAAA?w=239&h=180&c=7&r=0&o=7&pid=1.7&rm=3"
    ],
    places: ["Fazenda Carnielli", "Biscoitos Kebis", "Cervejaria Altezza", "Centro de Eventos Padre Cleto Caliman"],
    history: "Venda Nova do Imigrante é a capital nacional do agroturismo. Colonizada por italianos, a cidade mantém tradições como a Festa da Polenta, que atrai milhares de visitantes anualmente.",
    gastronomy: "Famosa pelo Socol, queijos artesanais, cafés especiais e o tradicional antepasto italiano. O agroturismo permite visitar as fazendas e comprar produtos diretamente dos produtores.",
    curiosities: "A cidade é pioneira no agroturismo no Brasil, transformando a rotina das fazendas em uma experiência turística única."
  }
];

function FadeInImage({ src, alt, className, loading = "lazy" }: { src: string, alt: string, className?: string, loading?: "lazy" | "eager" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-stone-200" />
      )}
      <img
        src={error ? "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=60&w=800" : src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

function RoteiroModal({ roteiro, onClose, contactInfo, onDownload }: { roteiro: any, onClose: () => void, contactInfo: any, onDownload: (url: string, filename: string) => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-64 md:h-80">
          <FadeInImage 
            src={roteiro.images ? roteiro.images[0] : roteiro.image} 
            alt={roteiro.title}
            className="w-full h-full"
            loading="eager"
          />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8">
            <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-2 inline-block">
              {roteiro.subtitle}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">{roteiro.title}</h2>
            {roteiro.timeDeparture && roteiro.timeReturn ? (
              <div className="flex items-center gap-2 mt-2 text-stone-500">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Ida: {roteiro.timeDeparture} | Volta: {roteiro.timeReturn}</span>
              </div>
            ) : roteiro.time && (
              <div className="flex items-center gap-2 mt-2 text-stone-500">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{roteiro.time}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <BookOpen className="w-5 h-5" />
                <h4 className="font-bold uppercase text-xs tracking-widest">História</h4>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{roteiro.history}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <Utensils className="w-5 h-5" />
                <h4 className="font-bold uppercase text-xs tracking-widest">Gastronomia</h4>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{roteiro.gastronomy}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-bold uppercase text-xs tracking-widest">Curiosidades</h4>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{roteiro.curiosities}</p>
            </div>
          </div>

          <div className="mb-12">
            <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" /> Pontos Visitados
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roteiro.places.map((place: string, idx: number) => (
                <div key={`${place}-${idx}`} className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <Camera className="w-3 h-3 text-stone-400" />
                  <span className="text-xs text-stone-600 font-medium">{place}</span>
                </div>
              ))}
            </div>
          </div>

          {roteiro.courtesy && roteiro.courtesy.length > 0 && (
            <div className="mb-12">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" /> Cortesias Incluídas
              </h4>
              <div className="flex flex-wrap gap-3">
                {roteiro.courtesy.map((item: string, idx: number) => (
                  <div key={`${item}-${idx}`} className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                    <span className="text-sm text-stone-700 font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {roteiro.flyer && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-orange-600" /> Flyer do Roteiro
                </h4>
                <button 
                  onClick={() => onDownload(roteiro.flyer, `flyer-${roteiro.title.toLowerCase().replace(/\s+/g, '-')}.jpg`)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-black/10"
                >
                  <Download className="w-4 h-4" />
                  Baixar Flyer
                </button>
              </div>
              <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-lg">
                <FadeInImage src={roteiro.flyer} alt="Flyer" className="w-full h-auto" />
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-stone-100">
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-xs text-stone-400 block uppercase font-bold tracking-widest mb-1">Investimento Geral</span>
                <span className="text-3xl font-bold text-orange-600">R$ {roteiro.price}</span>
              </div>
              {(roteiro.priceCash || roteiro.priceInstallment) && (
                <div className="flex gap-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  {roteiro.priceCash && (
                    <div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase block">À Vista</span>
                      <span className="text-sm font-black text-green-600">R$ {roteiro.priceCash}</span>
                    </div>
                  )}
                  {roteiro.priceInstallment && (
                    <div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase block">Parcelado</span>
                      <span className="text-sm font-black text-orange-600">R$ {roteiro.priceInstallment}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <a 
              href={`https://wa.me/${contactInfo.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-green-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-600/20"
            >
              <MessageCircle className="w-5 h-5" />
              Reservar via WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RoteiroImage({ roteiro }: { roteiro: any }) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = roteiro.images || [roteiro.image];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="md:w-2/5 relative overflow-hidden h-64 md:h-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full"
        >
          <FadeInImage 
            src={images[currentImage]} 
            alt={roteiro.title}
            className="w-full h-full"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:hidden" />
      <div className="absolute top-6 left-6 z-10">
        <span className="bg-[#ff4500] text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl">
          {roteiro.subtitle || "CITY TOUR ES"}
        </span>
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_: any, i: number) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImage ? 'bg-white w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingModal({ isOpen, onClose, roteiroTitle, contactInfo }: { isOpen: boolean, onClose: () => void, roteiroTitle: string, contactInfo: any, key?: string }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hour = new Date().getHours();
    let greeting = "bom dia";
    if (hour >= 12 && hour < 18) greeting = "boa tarde";
    else if (hour >= 18 || hour < 5) greeting = "boa noite";

    // Format date to DD/MM/YYYY for the message
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const message = `Olá, ${greeting}.

Me chamo *${name}* e gostaria de obter mais informações sobre o *tour para ${roteiroTitle}* na data *${formattedDate}*.

Fico no aguardo do seu retorno.
Desde já, agradeço pela atenção.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=${encodedMessage}`, '_blank');
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-stone-400" />
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Solicitar Reserva</h2>
          <p className="text-stone-500 text-sm">Preencha os dados abaixo para iniciarmos seu atendimento via WhatsApp.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Seu Nome</label>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Data Desejada</label>
            <input 
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-stone-900/10 flex items-center justify-center gap-3 group"
          >
            <span>Continuar para WhatsApp</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedRoteiro, setSelectedRoteiro] = useState<any>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'roteiros' | 'gallery'>('roteiros');
  const [loading, setLoading] = useState(true);
  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any>({
    phone: '5527998597568',
    whatsapp: '5527998597568',
    instagram: 'https://instagram.com/citytoures',
    facebook: 'https://facebook.com/citytoures',
    email: 'contato@citytoures.com.br'
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      window.open(url, '_blank');
    }
  };

  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rotRes, galRes] = await Promise.all([
          fetch('/api/roteiros'),
          fetch('/api/gallery')
        ]);
        if (rotRes.ok) {
          const rotData = await rotRes.json();
          setRoteiros(rotData);
        } else {
          setRoteiros(INITIAL_ROTEIROS);
        }
        if (galRes.ok) {
          const galData = await galRes.json();
          setGallery(galData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados", error);
        setRoteiros(INITIAL_ROTEIROS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingRoteiro, setBookingRoteiro] = useState<any>(null);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-orange-100 selection:text-orange-900">
      <AnimatePresence>
        {isBookingModalOpen && (
          <BookingModal 
            key="booking-modal"
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)} 
            roteiroTitle={bookingRoteiro?.title || ''} 
            contactInfo={contactInfo}
          />
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <motion.a 
        href={`https://wa.me/${contactInfo.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[100] bg-green-500 text-white p-4 rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center group"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-white text-stone-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-stone-100">
          Fale Conosco
        </span>
      </motion.a>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/3hNeKBx.png" 
              alt="VIX ES TURISMO Logo" 
              className="h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-stone-900' : 'text-white'}`}>
              VIX ES TURISMO
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Roteiros', 'Galeria'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className={`text-sm font-medium hover:text-orange-600 transition-colors ${scrolled ? 'text-stone-600' : 'text-white/90'}`}
              >
                {item}
              </a>
            ))}
            <a 
              href={`https://wa.me/${contactInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
            >
              Planejar Viagem
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={scrolled ? 'text-stone-900' : 'text-white'} />
            ) : (
              <Menu className={scrolled ? 'text-stone-900' : 'text-white'} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {['Roteiros', 'Galeria'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-semibold text-stone-900 border-b border-stone-100 pb-4"
                >
                  {item}
                </a>
              ))}
              <a 
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 text-white w-full py-4 rounded-2xl text-lg font-bold mt-4 text-center"
              >
                Planejar Viagem
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdmin && (
          <AdminPanel onClose={() => {
            setShowAdmin(false);
            // Recarregar dados ao fechar o admin
            fetch('/api/roteiros').then(r => r.json()).then(setRoteiros).catch(() => {});
            fetch('/api/gallery').then(r => r.json()).then(setGallery).catch(() => {});
          }} initialTab={adminTab} />
        )}
        {selectedRoteiro && (
          <RoteiroModal 
            key="roteiro-modal"
            roteiro={selectedRoteiro} 
            onClose={() => setSelectedRoteiro(null)} 
            contactInfo={contactInfo}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={contactInfo.heroImage || "https://upload.wikimedia.org/wikipedia/commons/0/03/Convento_da_Penha_e_Terceira_Ponte_com_Mar_e_Vit%C3%B3ria_ao_fundo.jpg"} 
            alt="Vitória ES" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#fafaf9]" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/20 border border-orange-600/30 text-orange-400 text-xs font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4" /> {contactInfo.heroTitle || "Descubra o Espírito Santo"}
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase">
              {contactInfo.heroTitle ? contactInfo.heroTitle.split(' ').slice(0, -2).join(' ') : "EXPLORE O"} <br />
              <span className="text-orange-600">{contactInfo.heroTitle ? contactInfo.heroTitle.split(' ').slice(-2).join(' ') : "MELHOR DO ESPÍRITO SANTO"}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              {contactInfo.heroSubtitle || "Roteiros exclusivos pelos melhores destinos do Espírito Santo com guias credenciados e conforto premium."}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a 
                href="#roteiros"
                className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-2xl shadow-orange-600/30 flex items-center gap-3 group"
              >
                Ver Roteiros
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-3"
              >
                Falar com Especialista
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-orange-600 to-transparent" />
        </motion.div>
      </section>

      <div className="pt-0">
        {/* Guide Safety Banner */}
      <section className="bg-orange-600 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-white text-center md:text-left">
          <div className="p-3 bg-white/20 rounded-full">
            <IdCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Viagem Segura com Guia Credenciado</h3>
            <p className="text-orange-100 text-sm">Sua segurança é nossa prioridade. Todos os nossos roteiros são acompanhados por guias profissionais registrados no CADASTUR.</p>
          </div>
        </div>
      </section>

      {/* Featured Roteiros Section */}
      <section id="roteiros" className="py-24 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative">
            <span className="text-orange-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
              Planeje sua Aventura
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
              Roteiros Exclusivos
            </h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
              Escolha um de nossos roteiros cuidadosamente planejados para você aproveitar o melhor do Espírito Santo com conforto e segurança.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key="roteiros-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {roteiros.map((roteiro, index) => (
                <motion.div 
                  key={roteiro.id || `roteiro-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedRoteiro(roteiro)}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-stone-100 flex flex-col md:flex-row group cursor-pointer hover:border-orange-200 transition-colors"
                >
                  <RoteiroImage roteiro={roteiro} />
                  <div className="md:w-3/5 p-6 md:p-10 flex flex-col justify-between relative bg-white">
                    <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20">
                      <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-[#00c853] uppercase tracking-widest bg-[#e8f5e9] px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#c8e6c9] shadow-sm">
                        <IdCard className="w-3 h-3 md:w-3.5 md:h-3.5" /> GUIA CREDENCIADO
                      </span>
                    </div>
                    
                    <div className="mt-8 md:mt-4">
                      <div className="mb-6">
                        <h3 className="text-2xl md:text-3xl font-bold text-[#1c1917] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{roteiro.title}</h3>
                        {roteiro.timeDeparture && roteiro.timeReturn ? (
                          <div className="flex items-center gap-2 mt-2 text-stone-500">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-xs md:text-[11px] font-bold uppercase tracking-wider">Ida: {roteiro.timeDeparture} | Volta: {roteiro.timeReturn}</span>
                          </div>
                        ) : roteiro.time && (
                          <div className="flex items-center gap-2 mt-2 text-stone-500">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{roteiro.time}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-8">
                        <h4 className="text-[10px] md:text-[11px] font-black text-stone-400 uppercase tracking-widest mb-4">O QUE VOCÊ VAI VISITAR:</h4>
                        <div className="flex flex-wrap gap-2">
                          {roteiro.places.slice(0, 4).map((place, idx) => (
                            <span key={`${place}-${idx}`} className="bg-[#f5f5f5] text-stone-600 px-3 py-2 md:px-4 md:py-2 rounded-xl text-[10px] md:text-[11px] font-bold">
                              {place}
                            </span>
                          ))}
                          {roteiro.places.length > 4 && (
                            <span className="text-[10px] md:text-[11px] text-stone-400 font-bold py-2 ml-1">+{roteiro.places.length - 4} LOCAIS</span>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedRoteiro(roteiro)}
                        className="text-[#ff4500] font-black text-xs md:text-sm flex items-center gap-2 hover:gap-3 transition-all mb-8 group/link"
                      >
                        Ver História e Detalhes 
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="mb-6 flex flex-col border-t border-stone-100 pt-6 gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] md:text-[11px] font-black text-stone-400 uppercase tracking-widest">Valor do Investimento</span>
                        <div className="flex items-baseline gap-1 whitespace-nowrap">
                          <span className="text-sm md:text-base font-black text-[#ff4500]">R$</span>
                          <span className="text-2xl md:text-3xl font-black text-[#ff4500]">{roteiro.price}</span>
                        </div>
                      </div>
                      
                      {(roteiro.priceCash || roteiro.priceInstallment) && (
                        <div className="flex flex-col gap-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                          {roteiro.priceCash && (
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">À Vista:</span>
                              <span className="text-sm font-black text-green-600">R$ {roteiro.priceCash}</span>
                            </div>
                          )}
                          {roteiro.priceInstallment && (
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Parcelado:</span>
                              <span className="text-sm font-black text-orange-600">R$ {roteiro.priceInstallment}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        setBookingRoteiro(roteiro);
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full bg-[#1c1917] text-white py-4 md:py-5 rounded-[1.25rem] md:rounded-[1.5rem] font-black hover:bg-[#ff4500] transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-black/10"
                    >
                      <span className="text-sm md:text-base">Reservar Agora</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

    </div>

      {/* Gallery Section */}
      <section id="galeria" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
              Nossos Registros
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
              Galeria de Momentos
            </h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
              Confira alguns dos momentos inesquecíveis registrados em nossos roteiros pelo Espírito Santo.
            </p>
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {gallery.map((item, index) => (
              <motion.div
                key={item.id || `gallery-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="break-inside-avoid rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                <img 
                  src={item.url} 
                  alt="Gallery" 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>

          {gallery.length === 0 && (
            <div className="text-center py-20 bg-stone-50 rounded-[3rem] border border-dashed border-stone-200">
              <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-400 font-medium">Em breve, novas fotos aqui!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <img 
                  src="https://i.imgur.com/3hNeKBx.png" 
                  alt="VIX ES TURISMO Logo" 
                  className="h-14 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="font-bold text-xl tracking-tight text-stone-900">
                  VIX ES TURISMO
                </span>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">
                Sua porta de entrada para o paraíso capixaba. Descubra, explore e apaixone-se por Vitória.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/city_tour_es/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                {[Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-8 uppercase text-xs tracking-widest">Navegação</h4>
              <ul className="flex flex-col gap-4">
                {['Roteiros', 'Galeria'].map(item => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-sm text-stone-500 hover:text-orange-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-8 uppercase text-xs tracking-widest">Suporte</h4>
              <ul className="flex flex-col gap-4">
                {['Centro de Ajuda', 'FAQ', 'Contatos', 'Privacidade', 'Termos'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-stone-500 hover:text-orange-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-8 uppercase text-xs tracking-widest">Newsletter</h4>
              <p className="text-sm text-stone-500 mb-6">Receba dicas e ofertas exclusivas de viagem.</p>
              <div className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="bg-white border border-stone-200 px-6 py-3 rounded-2xl text-sm focus:outline-none focus:border-orange-600 transition-colors"
                />
                <button className="bg-orange-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-orange-700 transition-colors">
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <p className="text-stone-400 text-xs">
                © 2024 VIX ES TURISMO. Todos os direitos reservados.
              </p>
              <button 
                onClick={() => {
                  setAdminTab('roteiros');
                  setShowAdmin(true);
                }}
                className="text-stone-400 hover:text-orange-600 transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                Admin
              </button>
            </div>
            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <MapPin className="w-3 h-3" />
              <span>Vitória, Espírito Santo - Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
