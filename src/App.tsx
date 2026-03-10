/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { collection, getDocs, addDoc, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import AdminPanel from './components/AdminPanel';
import { 
  MapPin, 
  Navigation, 
  Camera, 
  Utensils, 
  Waves, 
  Sun, 
  ChevronRight, 
  Instagram, 
  Facebook, 
  Twitter,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  Info,
  BookOpen,
  Coffee,
  Sparkles,
  Car,
  IdCard,
  Clock,
  Users,
  Flame,
  ChefHat
} from 'lucide-react';

const INITIAL_ROTEIROS = [
  {
    title: "Praias de Guarapari",
    subtitle: "ROTEIRO 1",
    price: "450,00",
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
    time: "08:00 às 16:00",
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
    time: "08:00 às 16:00",
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

function SunsetModal({ onClose }: { onClose: () => void }) {
  const locations = [
    {
      title: "1- CURVA DA JUREMA (VITÓRIA)",
      image: "https://midias.agazeta.com.br/2024/09/09/nascer-do-sol-na-curva-da-jurema-2417744-article.jpg",
      type: "NASCER DO SOL",
      credit: "Instagram/@remarvix"
    },
    {
      title: "2- CAMBURI (VITÓRIA)",
      image: "https://midias.agazeta.com.br/2024/09/09/o-nascer-do-sol-da-praia-de-camburi-em-vitoria-2417642-article.jpg",
      type: "NASCER DO SOL",
      credit: "Ramon Alves"
    },
    {
      title: "3- MANGUINHOS (SERRA)",
      image: "https://midias.agazeta.com.br/2024/09/09/o-nascer-do-sol-em-manguinhos-na-serra-e-encantador-2417764-article.jpg",
      type: "NASCER DO SOL",
      credit: "Reprodução/Instagram/@docemanguinhos"
    },
    {
      title: "4- MORRO DO MORENO (VILA VELHA)",
      image: "https://midias.agazeta.com.br/2024/09/10/o-nascer-do-sol-no-morro-do-moreno-2419702-article.png",
      type: "NASCER DO SOL",
      credit: "Reprodução/Instagram/@mariojuniorjo/@cafeoracaomorrodomoreno"
    },
    {
      title: "5- FONTE GRANDE (VITÓRIA)",
      image: "https://midias.agazeta.com.br/2024/09/09/o-por-do-sol-no-parque-da-fonte-grande-e-um-verdadeiro-espetaculo-2417777-article.jpg",
      type: "PÔR DO SOL",
      credit: "Reprodução/Instagram/@tavares.expedicoes"
    },
    {
      title: "6- ILHA DAS CAIEIRAS (VITÓRIA)",
      image: "https://midias.agazeta.com.br/2024/09/09/por-do-sol-da-ilha-das-caieiras--2417643-article.jpg",
      type: "PÔR DO SOL",
      credit: "Reprodução/Instagram/@vanda_lopes1000"
    },
    {
      title: "7- ORLA DE PORTO DE SANTANA (CARIACICA)",
      image: "https://midias.agazeta.com.br/2024/09/09/a-orla-de-cariacica-e-um-point-para-assistir-o-por-do-sol-2417792-article.jpg",
      type: "PÔR DO SOL",
      credit: "Reprodução/Instagram/@rfotosporai/@orladecariacica"
    },
    {
      title: "8- CONVENTO DA PENHA (VILA VELHA)",
      image: "https://midias.agazeta.com.br/2024/09/09/visao-do-convento-da-penha-no-por-do-sol-2417833-article.jpg",
      type: "PÔR DO SOL",
      credit: "Reprodução/Instagram/@visaodrone027"
    },
    {
      title: "9- BEIRA MAR (VITÓRIA)",
      image: "https://midias.agazeta.com.br/2024/09/09/por-do-sol-da-baia-de-vitoria-2417644-article.jpg",
      type: "PÔR DO SOL",
      credit: "Jansen Dias Lube"
    },
    {
      title: "10- MEAÍPE - GUARAPARI",
      image: "https://midias.agazeta.com.br/2024/09/09/o-por-do-sol-em-meaipe-guarapari-parece-cena-de-filme-2417842-article.jpg",
      type: "PÔR DO SOL",
      credit: "Evelize Calmon"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-48 md:h-64 shrink-0 bg-stone-900 flex items-center justify-center overflow-hidden">
          <img 
            src="https://midias.agazeta.com.br/2024/09/09/por-do-sol-da-ilha-das-caieiras--2417643-article.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
            alt="Background"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000";
            }}
          />
          <div className="relative z-10 text-center px-8">
            <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
              Guia de Contemplação
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Onde ver o nascer e pôr do sol na Grande Vitória?</h2>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">Veja lista com 10 locais mágicos para acompanhar esse momento da natureza.</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto">
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Felipe Khoury</p>
                <p className="text-xs text-stone-400">Repórter / fkhoury@redegazeta.com.br</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400 uppercase font-bold tracking-widest">Publicado em</p>
              <p className="text-sm font-bold text-stone-900">15 de setembro de 2024 às 10:00</p>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-stone-600 leading-relaxed mb-6">
              Se temos uma certeza na vida é de que o sol nasce - e se põe - para todos. Por isso, não é à toa que muita gente procura lugares e pontos estratégicos para acompanhar esse momento mágico da natureza. Seja na praia ou nas montanhas, é possível sentir essa energia de vários cantinhos do Estado.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Entre pontos famosos, como o Morro do Moreno e o Convento da Penha, até alguns menos explorados, como ‘cantinhos’ em Meaípe e Manguinhos, preparamos uma lista para inspirar você a curtir o início e final de um dia ensolarado.
            </p>
          </div>

          <div className="space-y-16">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
                <Sun className="w-6 h-6 text-orange-500" /> NASCER DO SOL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {locations.filter(l => l.type === "NASCER DO SOL").map(loc => (
                  <div key={loc.title} className="group">
                    <div className="aspect-video rounded-3xl overflow-hidden mb-4 shadow-lg bg-stone-100">
                      <img 
                        src={loc.image} 
                        alt={loc.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/seed/${loc.title}/800/450`;
                        }}
                      />
                    </div>
                    <h4 className="font-bold text-stone-900 mb-1">{loc.title}</h4>
                    <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Crédito: {loc.credit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
                <Waves className="w-6 h-6 text-blue-500" /> PÔR DO SOL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {locations.filter(l => l.type === "PÔR DO SOL").map(loc => (
                  <div key={loc.title} className="group">
                    <div className="aspect-video rounded-3xl overflow-hidden mb-4 shadow-lg bg-stone-100">
                      <img 
                        src={loc.image} 
                        alt={loc.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/seed/${loc.title}/800/450`;
                        }}
                      />
                    </div>
                    <h4 className="font-bold text-stone-900 mb-1">{loc.title}</h4>
                    <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Crédito: {loc.credit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MoquecaModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-64 md:h-96 shrink-0">
          <img 
            src="https://th.bing.com/th/id/R.cf064b34bd5a5cec1866ce029cf3de86?rik=W6sqI2x0OZ4uNw&riu=http%3a%2f%2fwww.portaltemponovo.com.br%2fwp-content%2fuploads%2f2015%2f09%2fmoqueca-capixaba1-641.jpg&ehk=GH25fQxmlrMj0zZW%2fHA2IcJXStY7YbH%2bAZLu5Rrt8wM%3d&risl=&pid=ImgRaw&r=0" 
            alt="Moqueca Capixaba Tradicional"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1000";
            }}
          />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-2 inline-block">
              Receita Tradicional
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900">Moqueca Capixaba Tradicional</h2>
          </div>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto">
          <div className="mb-10">
            <p className="text-stone-600 text-lg leading-relaxed italic border-l-4 border-orange-500 pl-6">
              "A moqueca capixaba é um prato típico do Espírito Santo, preparado sem leite de coco nem dendê, diferente da versão baiana. Seu sabor autêntico vem do peixe fresco, do colorau, do coentro e do azeite de oliva ou urucum. Um prato leve, saboroso e ideal tanto para refeições familiares quanto para cardápios profissionais."
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
              <Clock className="w-5 h-5 text-orange-600 mb-2" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Preparação</span>
              <span className="text-sm font-bold text-stone-900">20 min</span>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
              <Flame className="w-5 h-5 text-orange-600 mb-2" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Cozimento</span>
              <span className="text-sm font-bold text-stone-900">40 min</span>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
              <Users className="w-5 h-5 text-orange-600 mb-2" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Porções</span>
              <span className="text-sm font-bold text-stone-900">6 pessoas</span>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center">
              <ChefHat className="w-5 h-5 text-orange-600 mb-2" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Calorias</span>
              <span className="text-sm font-bold text-stone-900">320 kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" /> Ingredientes
              </h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-4">Peixe e Marinada</h4>
                  <ul className="space-y-3">
                    {[
                      "1,2 kg postas de peixe firme (robalo, badejo ou dourado)",
                      "10 g sal",
                      "5 g pimenta do reino",
                      "40 g suco de limão"
                    ].map(item => (
                      <li key={item} className="flex items-start gap-3 text-stone-600 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-4">Refogado e Montagem</h4>
                  <ul className="space-y-3">
                    {[
                      "80 g azeite de oliva",
                      "40 g azeite de urucum ou colorau refogado em azeite",
                      "300 g cebola em cubos ou rodelas",
                      "200 g tomate em cubos ou rodelas",
                      "30 g alho picado",
                      "50 g coentro picado",
                      "20 g cebolinha picada",
                      "qb água (somente se for necessário)"
                    ].map(item => (
                      <li key={item} className="flex items-start gap-3 text-stone-600 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-600" /> Instruções
              </h3>
              <ul className="space-y-6">
                {[
                  "Tempere as postas de peixe com sal, pimenta e suco de limão. Reserve por 15 minutos.",
                  "Aqueça o azeite de oliva e o azeite de urucum em uma panela de barro (ou de fundo grosso).",
                  "Frite o alho. Faça camadas com cebola, tomate e coentro.",
                  "Coloque as postas de peixe sobre os legumes e regue com um pouco do caldo quente (se for necessário).",
                  "Tampe a panela e cozinhe em fogo baixo por cerca de 25 a 30 minutos, mexendo apenas a panela (não use colher para não desmanchar o peixe).",
                  "Acrescente o coentro e a cebolinha picados. Ajuste o sal, desligue o fogo e deixe descansar 5 minutos antes de servir."
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-stone-600 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-12 p-6 bg-orange-50 rounded-3xl border border-orange-100">
                <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3">Notas do Chef</h4>
                <ul className="space-y-2">
                  <li className="text-xs text-orange-800 leading-relaxed">• Tradicionalmente, a moqueca capixaba é servida com arroz branco e pirão feito com o caldo do cozimento.</li>
                  <li className="text-xs text-orange-800 leading-relaxed">• O peixe deve ser fresco e de carne firme para não se desfazer durante o cozimento.</li>
                  <li className="text-xs text-orange-800 leading-relaxed">• O uso da panela de barro capixaba é típico e realça o sabor.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

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

function RoteiroModal({ roteiro, onClose, contactInfo }: { roteiro: any, onClose: () => void, contactInfo: any }) {
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
              {roteiro.places.map((place: string) => (
                <div key={place} className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <Camera className="w-3 h-3 text-stone-400" />
                  <span className="text-xs text-stone-600 font-medium">{place}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-stone-100">
            <div>
              <span className="text-xs text-stone-400 block uppercase font-bold tracking-widest mb-1">Investimento</span>
              <span className="text-3xl font-bold text-orange-600">R$ {roteiro.price}</span>
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

const experiences = [
  {
    title: "Moqueca Capixaba",
    description: "O prato mais famoso do estado. 'Moqueca é capixaba, o resto é peixada'.",
    icon: <Utensils className="w-6 h-6" />,
    color: "bg-orange-500"
  },
  {
    title: "Passeio de Escuna",
    description: "Navegue pela baía de Vitória e descubra a cidade por um novo ângulo.",
    icon: <Waves className="w-6 h-6" />,
    color: "bg-blue-500"
  },
  {
    title: "Pôr do Sol no Canal",
    description: "Um espetáculo diário que colore o céu de Vitória em tons de dourado.",
    icon: <Sun className="w-6 h-6" />,
    color: "bg-yellow-500"
  }
];

function BookingModal({ isOpen, onClose, roteiroTitle, contactInfo }: { isOpen: boolean, onClose: () => void, roteiroTitle: string, contactInfo: any }) {
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
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
    </div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedRoteiro, setSelectedRoteiro] = useState<any>(null);
  const [showMoquecaRecipe, setShowMoquecaRecipe] = useState(false);
  const [showSunsetGuide, setShowSunsetGuide] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<any>({
    phone: '5527998597568',
    whatsapp: '5527998597568',
    instagram: 'https://instagram.com/citytoures',
    facebook: 'https://facebook.com/citytoures',
    email: 'contato@citytoures.com.br'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Roteiros
        const q = query(collection(db, 'roteiros'));
        const querySnapshot = await getDocs(q);
        
        let roteirosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        // Check for missing initial roteiros
        const existingTitles = new Set(roteirosData.map(r => r.title));
        let addedAny = false;

        for (const initial of INITIAL_ROTEIROS) {
          if (!existingTitles.has(initial.title)) {
            const docRef = await addDoc(collection(db, 'roteiros'), initial);
            roteirosData.push({ id: docRef.id, ...initial });
            addedAny = true;
          }
        }

        // Sort by subtitle (handling missing subtitles)
        roteirosData.sort((a, b) => {
          const subA = (a.subtitle || '').toUpperCase();
          const subB = (b.subtitle || '').toUpperCase();
          return subA.localeCompare(subB);
        });

        // One-time updates/cleanups
        const finalRoteiros = roteirosData.map(data => {
          let updatedData = { ...data };
          let hasChanges = false;

          // One-time cleanup for Cachoeira da Bica
          if (data.places?.includes("Cachoeira da Bica") || data.images?.some((img: string) => img.includes("cachoeira-da-bica"))) {
            updatedData.places = data.places?.filter((p: string) => p !== "Cachoeira da Bica");
            updatedData.images = data.images?.filter((img: string) => !img.includes("cachoeira-da-bica"));
            hasChanges = true;
          }

          // One-time update for Portal da Cidade image
          if (data.title === "Domingos Martins e Pedra Azul" && !data.images?.includes("https://i.imgur.com/JzgCJM6.jpeg")) {
            updatedData.images = [...(updatedData.images || []), "https://i.imgur.com/JzgCJM6.jpeg"];
            hasChanges = true;
          }

          if (hasChanges && data.id) {
            const { id, ...updatePayload } = updatedData;
            updateDoc(doc(db, 'roteiros', id), updatePayload);
            return updatedData;
          }
          return data;
        });

        setRoteiros(finalRoteiros);

        // Fetch Settings
        const settingsSnap = await getDocs(collection(db, 'settings'));
        if (!settingsSnap.empty) {
          setContactInfo(settingsSnap.docs[0].data());
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to initial data if firebase fails
        setRoteiros(INITIAL_ROTEIROS);
        setLoading(false);
      }
    };

    fetchData();
  }, [showAdmin]); // Refresh when closing admin
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingRoteiro, setBookingRoteiro] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            {['Roteiros', 'Experiências', 'Gastronomia', 'Sobre'].map((item) => (
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {['Roteiros', 'Experiências', 'Gastronomia', 'Sobre'].map((item) => (
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
          <AdminPanel onExit={() => setShowAdmin(false)} />
        )}
        {selectedRoteiro && (
          <RoteiroModal 
            roteiro={selectedRoteiro} 
            onClose={() => setSelectedRoteiro(null)} 
            contactInfo={contactInfo}
          />
        )}
        {showMoquecaRecipe && (
          <MoquecaModal onClose={() => setShowMoquecaRecipe(false)} />
        )}
        {showSunsetGuide && (
          <SunsetModal onClose={() => setShowSunsetGuide(false)} />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/03/Convento_da_Penha_e_Terceira_Ponte_com_Mar_e_Vit%C3%B3ria_ao_fundo.jpg" 
            alt="Convento da Penha e Terceira Ponte" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            referrerPolicy="no-referrer"
            loading="eager"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=60&w=1920";
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
              Bem-vindo ao Espírito Santo
            </span>
            <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-[0.9]">
              Descubra a Magia de <span className="text-orange-400">Vitória</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Entre montanhas e o mar, a capital do Espírito Santo guarda segredos históricos, praias paradisíacas e a melhor gastronomia do Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#roteiros"
                className="bg-white text-stone-900 px-8 py-4 rounded-full font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-2 group"
              >
                Explorar Roteiros
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                Falar com Guia
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

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
          <div className="text-center mb-16">
            <span className="text-orange-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Planeje sua Aventura</span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">Roteiros Exclusivos</h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
              Escolha um de nossos roteiros cuidadosamente planejados para você aproveitar o melhor do Espírito Santo com conforto e segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {roteiros.map((roteiro, index) => (
              <motion.div 
                key={roteiro.id}
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
                    </div>
                    
                    <div className="mb-8">
                      <h4 className="text-[10px] md:text-[11px] font-black text-stone-400 uppercase tracking-widest mb-4">O QUE VOCÊ VAI VISITAR:</h4>
                      <div className="flex flex-wrap gap-2">
                        {roteiro.places.slice(0, 4).map(place => (
                          <span key={place} className="bg-[#f5f5f5] text-stone-600 px-3 py-2 md:px-4 md:py-2 rounded-xl text-[10px] md:text-[11px] font-bold">
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

                  <div className="mb-6 flex items-center justify-between border-t border-stone-100 pt-6">
                    <span className="text-[10px] md:text-[11px] font-black text-stone-400 uppercase tracking-widest">Valor do Investimento</span>
                    <div className="flex items-baseline gap-1 whitespace-nowrap">
                      <span className="text-sm md:text-base font-black text-[#ff4500]">R$</span>
                      <span className="text-2xl md:text-3xl font-black text-[#ff4500]">{roteiro.price}</span>
                    </div>
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
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-24 px-6 bg-stone-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-4 block">Siga-nos</span>
              <h2 className="text-5xl md:text-6xl font-serif text-stone-900 mb-8 leading-tight">
                Acompanhe nossas <br />
                <span className="italic">aventuras diárias</span>
              </h2>
              <p className="text-xl text-stone-600 mb-10 max-w-lg">
                Fique por dentro de novos roteiros, dicas exclusivas e as melhores paisagens do Espírito Santo em tempo real.
              </p>
              <a 
                href="https://www.instagram.com/city_tour_es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-all shadow-2xl shadow-pink-500/20"
              >
                <Instagram size={24} />
                Acessar Instagram
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              {/* Phone Mockup */}
              <div className="relative w-[300px] h-[600px] bg-stone-900 rounded-[3rem] border-[8px] border-stone-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-800 rounded-b-2xl z-20" />
                <div className="absolute inset-0 z-10">
                  <FadeInImage 
                    src="https://i.imgur.com/72VAfVe.png" 
                    alt="Instagram Preview" 
                    className="w-full h-full"
                  />
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-200/50 rounded-full blur-3xl" />
              <div className="absolute -z-10 top-1/4 right-0 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gastronomy Highlight */}
      <section id="gastronomia" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <FadeInImage 
                src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=60&w=800" 
                alt="Moqueca Capixaba" 
                className="w-full h-full"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl max-w-[240px] hidden md:block">
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(i => <Sun key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />)}
              </div>
              <p className="text-stone-900 font-bold italic text-lg leading-tight mb-2">
                "A melhor moqueca que já provei na vida!"
              </p>
              <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">— Crítico Gastronômico</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-orange-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Sabor Autêntico</span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-8 tracking-tight leading-tight">
              Uma viagem pelo paladar <br /> das montanhas ao mar.
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-10">
              A culinária capixaba é uma mistura rica de influências indígenas, africanas e europeias. Nossa moqueca, preparada em tradicionais panelas de barro de Goiabeiras, é um patrimônio cultural que você não pode deixar de experimentar.
            </p>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <h4 className="font-bold text-stone-900 mb-2">Panelas de Barro</h4>
                <p className="text-sm text-stone-500">Artesanato secular reconhecido pelo IPHAN.</p>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 mb-2">Frutos do Mar</h4>
                <p className="text-sm text-stone-500">Ingredientes frescos pescados diariamente.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowMoquecaRecipe(true)}
              className="bg-stone-900 text-white px-10 py-4 rounded-full font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
            >
              Guia Gastronômico
            </button>
          </motion.div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Nossa Frota</span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">Veículos para sua Viagem</h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
              Contamos com veículos modernos e confortáveis para garantir a melhor experiênia em seus passeios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-stone-50 rounded-[2.5rem] overflow-hidden border border-stone-100 group"
            >
              <div className="h-64 overflow-hidden">
                <FadeInImage 
                  src="https://th.bing.com/th/id/R.0ad79dd8d3412fd581d478ec14806169?rik=tmqoKvlw%2fAwtCA&riu=http%3a%2f%2fcdni.autocarindia.com%2fGalleries%2f20171116073907_virz3.jpg&ehk=zsyEGZpnVZTWR7OhYszlyECrRRxRMTaCJSWRzTLWEcM%3d&risl=&pid=ImgRaw&r=0" 
                  alt="WV VIRTUS" 
                  className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 text-orange-600 mb-4">
                  <Car className="w-5 h-5" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">Passeios Executivos</h4>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">WV VIRTUS</h3>
                <p className="text-stone-600 text-sm leading-relaxed">Ideal para passeios privativos e executivos de poucas pessoas, oferecendo máximo conforto e sofisticação.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-stone-50 rounded-[2.5rem] overflow-hidden border border-stone-100 group"
            >
              <div className="h-64 overflow-hidden">
                <FadeInImage 
                  src="https://irmaosbelfort.com.br/vans/van1.jpg" 
                  alt="Van Executiva" 
                  className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 text-orange-600 mb-4">
                  <Car className="w-5 h-5" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">Passeios em Grupo</h4>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Van Executiva</h3>
                <p className="text-stone-600 text-sm leading-relaxed">Perfeita para grupos maiores, garantindo que todos viajem juntos com segurança, espaço e ar-condicionado.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experiências" className="bg-stone-900 py-24 px-6 overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-orange-500 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Experiências Únicas</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Viva o Espírito Capixaba</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {experiences.map((exp, index) => (
              <motion.div 
                key={exp.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-sm hover:bg-white/10 transition-all group"
              >
                <div className={`${exp.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform`}>
                  {exp.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{exp.title}</h3>
                <p className="text-white/60 leading-relaxed mb-8">
                  {exp.description}
                </p>
                <button 
                  onClick={() => {
                    if (exp.title === "Moqueca Capixaba") setShowMoquecaRecipe(true);
                    if (exp.title === "Pôr do Sol no Canal") setShowSunsetGuide(true);
                  }}
                  className="text-white font-semibold flex items-center gap-2 group-hover:text-orange-500 transition-colors"
                >
                  Saiba mais <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
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
                {['Destinos', 'Experiências', 'Gastronomia', 'Roteiros', 'Blog'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-stone-500 hover:text-orange-600 transition-colors">{item}</a>
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
                onClick={() => setShowAdmin(true)}
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
