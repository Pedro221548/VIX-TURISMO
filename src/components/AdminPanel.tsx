import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Image as ImageIcon, 
  MapPin, 
  DollarSign, 
  Clock,
  Phone,
  Instagram,
  Facebook,
  LogOut,
  Lock,
  User as UserIcon,
  Upload,
  Loader2,
  Download,
  Database,
  Sun,
  Utensils,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Roteiro {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  priceCash?: string;
  priceInstallment?: string;
  time?: string;
  images: string[];
  places: string[];
  history: string;
  gastronomy: string;
  curiosities: string;
  courtesy?: string[];
  flyer?: string;
  timeDeparture?: string;
  timeReturn?: string;
}

interface ContactInfo {
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
}

interface QuickPost {
  id: string;
  image: string;
  description: string;
  comment: string;
  createdAt: number;
}

interface SunsetLocation {
  id: string;
  title: string;
  image: string;
  type: 'NASCER DO SOL' | 'PÔR DO SOL';
  credit: string;
}

interface MoquecaRecipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  calories: string;
  ingredients: {
    marinade: string[];
    cooking: string[];
  };
  instructions: string[];
  notes: string[];
  image: string;
}

interface Experience {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface HeroData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
}

export default function AdminPanel({ onExit, initialTab }: { onExit: () => void, initialTab?: 'roteiros' | 'quickPosts' | 'sunset' | 'moqueca' | 'experiences' | 'hero' | 'settings' }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [quickPosts, setQuickPosts] = useState<QuickPost[]>([]);
  const [sunsetLocations, setSunsetLocations] = useState<SunsetLocation[]>([]);
  const [moquecaRecipe, setMoquecaRecipe] = useState<MoquecaRecipe | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRoteiro, setEditingRoteiro] = useState<Partial<Roteiro> | null>(null);
  const [editingQuickPost, setEditingQuickPost] = useState<Partial<QuickPost> | null>(null);
  const [editingSunset, setEditingSunset] = useState<Partial<SunsetLocation> | null>(null);
  const [editingExperience, setEditingExperience] = useState<Partial<Experience> | null>(null);
  const [editingMoqueca, setEditingMoqueca] = useState<Partial<MoquecaRecipe> | null>(null);
  const [editingHero, setEditingHero] = useState<Partial<HeroData> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(initialTab || 'roteiros');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    email: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Roteiros
      const q = query(collection(db, 'roteiros'));
      const querySnapshot = await getDocs(q);
      const roteirosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Roteiro[];

      // Sort numerically by subtitle (e.g., "Roteiro 1", "Roteiro 2")
      roteirosData.sort((a, b) => {
        const getNum = (s: string) => {
          const match = s.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getNum(a.subtitle) - getNum(b.subtitle);
      });

      setRoteiros(roteirosData);

      // Fetch Quick Posts
      const qp = query(collection(db, 'quick_posts'), orderBy('createdAt', 'desc'));
      const qpSnapshot = await getDocs(qp);
      const qpData = qpSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuickPost[];
      setQuickPosts(qpData);
      
      // Fetch Sunset Locations
      const sunsetSnap = await getDocs(collection(db, 'sunset_locations'));
      setSunsetLocations(sunsetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SunsetLocation[]);

      // Fetch Moqueca Recipe
      const moquecaSnap = await getDocs(collection(db, 'moqueca_recipe'));
      if (!moquecaSnap.empty) {
        setMoquecaRecipe({ id: moquecaSnap.docs[0].id, ...moquecaSnap.docs[0].data() } as MoquecaRecipe);
      }

      // Fetch Experiences
      const expSnap = await getDocs(collection(db, 'experiences'));
      setExperiences(expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Experience[]);

      // Fetch Hero Data
      const heroSnap = await getDocs(collection(db, 'hero_data'));
      if (!heroSnap.empty) {
        setHeroData({ id: heroSnap.docs[0].id, ...heroSnap.docs[0].data() } as HeroData);
      }

      // Fetch Contact Info
      const contactSnap = await getDocs(collection(db, 'settings'));
      if (!contactSnap.empty) {
        const data = contactSnap.docs[0].data() as ContactInfo;
        setContactInfo(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError('Email ou senha incorretos.');
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onExit();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
      // Fallback: open in new tab if fetch fails (CORS)
      window.open(url, '_blank');
    }
  };

  const handleFileUpload = async (file: File, path: string): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);
    try {
      let fileToUpload = file;
      
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: false // Desabilitado para maior compatibilidade em iframes
        };
        fileToUpload = await imageCompression(file, options);
      } catch (compressionError) {
        console.warn("Compression failed, uploading original file", compressionError);
        fileToUpload = file;
      }

      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      return new Promise((resolve, reject) => {
        // Forçar um progresso inicial para feedback visual
        setUploadProgress(1);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Garantir que o progresso seja pelo menos 1% se o upload começou
            setUploadProgress(Math.max(progress, 1));
          }, 
          (error) => {
            console.error("Error uploading file:", error);
            alert("Erro ao fazer upload da imagem. Verifique sua conexão ou permissões.");
            setUploading(false);
            setUploadProgress(0);
            reject(error);
          }, 
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              setUploading(false);
              setUploadProgress(0);
              resolve(url);
            } catch (urlError) {
              console.error("Error getting download URL:", urlError);
              setUploading(false);
              setUploadProgress(0);
              reject(urlError);
            }
          }
        );
      });
    } catch (error) {
      console.error("General upload error:", error);
      setUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleSaveRoteiro = async () => {
    if (!editingRoteiro?.title) return;

    try {
      if (editingRoteiro.id) {
        const { id, ...data } = editingRoteiro;
        await updateDoc(doc(db, 'roteiros', id), data);
      } else {
        await addDoc(collection(db, 'roteiros'), editingRoteiro);
      }
      setEditingRoteiro(null);
      fetchData();
    } catch (error) {
      console.error("Error saving roteiro:", error);
    }
  };

  const handleDeleteRoteiro = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este roteiro?')) return;
    try {
      await deleteDoc(doc(db, 'roteiros', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting roteiro:", error);
    }
  };

  const handleSaveQuickPost = async () => {
    if (!editingQuickPost?.image) return;

    try {
      if (editingQuickPost.id) {
        const { id, ...data } = editingQuickPost;
        await updateDoc(doc(db, 'quick_posts', id), data);
      } else {
        await addDoc(collection(db, 'quick_posts'), {
          ...editingQuickPost,
          createdAt: Date.now()
        });
      }
      setEditingQuickPost(null);
      fetchData();
    } catch (error) {
      console.error("Error saving quick post:", error);
    }
  };

  const handleDeleteQuickPost = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await deleteDoc(doc(db, 'quick_posts', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting quick post:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const settingsSnap = await getDocs(collection(db, 'settings'));
      if (settingsSnap.empty) {
        await addDoc(collection(db, 'settings'), contactInfo);
      } else {
        await updateDoc(doc(db, 'settings', settingsSnap.docs[0].id), contactInfo as any);
      }
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleSaveSunset = async () => {
    if (!editingSunset?.title) return;
    try {
      if (editingSunset.id) {
        const { id, ...data } = editingSunset;
        await updateDoc(doc(db, 'sunset_locations', id), data);
      } else {
        await addDoc(collection(db, 'sunset_locations'), editingSunset);
      }
      setEditingSunset(null);
      fetchData();
    } catch (error) {
      console.error("Error saving sunset location:", error);
    }
  };

  const handleDeleteSunset = async (id: string) => {
    if (!confirm('Excluir este local?')) return;
    try {
      await deleteDoc(doc(db, 'sunset_locations', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting sunset location:", error);
    }
  };

  const handleSaveExperience = async () => {
    if (!editingExperience?.title) return;
    try {
      if (editingExperience.id) {
        const { id, ...data } = editingExperience;
        await updateDoc(doc(db, 'experiences', id), data);
      } else {
        await addDoc(collection(db, 'experiences'), editingExperience);
      }
      setEditingExperience(null);
      fetchData();
    } catch (error) {
      console.error("Error saving experience:", error);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Excluir esta experiência?')) return;
    try {
      await deleteDoc(doc(db, 'experiences', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const handleSaveMoqueca = async () => {
    if (!editingMoqueca?.title) return;
    try {
      if (editingMoqueca.id) {
        const { id, ...data } = editingMoqueca;
        await updateDoc(doc(db, 'moqueca_recipe', id), data);
      } else {
        await addDoc(collection(db, 'moqueca_recipe'), editingMoqueca);
      }
      setEditingMoqueca(null);
      fetchData();
    } catch (error) {
      console.error("Error saving moqueca recipe:", error);
    }
  };

  const handleSaveHero = async () => {
    if (!editingHero?.title) return;
    try {
      if (editingHero.id) {
        const { id, ...data } = editingHero;
        await updateDoc(doc(db, 'hero_data', id), data);
      } else {
        await addDoc(collection(db, 'hero_data'), editingHero);
      }
      setEditingHero(null);
      fetchData();
    } catch (error) {
      console.error("Error saving hero data:", error);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm('Deseja popular o banco de dados com os dados iniciais? Isso só deve ser feito se o banco estiver vazio.')) return;
    
    try {
      setLoading(true);
      
      // Seed Roteiros if empty
      if (roteiros.length === 0) {
        const initialRoteiros = [
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
          }
        ];
        for (const r of initialRoteiros) {
          await addDoc(collection(db, 'roteiros'), r);
        }
      }

      // Seed Sunset if empty
      if (sunsetLocations.length === 0) {
        const initialSunset = [
          { title: "1- CURVA DA JUREMA (VITÓRIA)", image: "https://midias.agazeta.com.br/2024/09/09/nascer-do-sol-na-curva-da-jurema-2417744-article.jpg", type: "NASCER DO SOL", credit: "Instagram/@remarvix" },
          { title: "2- CAMBURI (VITÓRIA)", image: "https://midias.agazeta.com.br/2024/09/09/o-nascer-do-sol-da-praia-de-camburi-em-vitoria-2417642-article.jpg", type: "NASCER DO SOL", credit: "Ramon Alves" },
          { title: "3- MANGUINHOS (SERRA)", image: "https://midias.agazeta.com.br/2024/09/09/o-nascer-do-sol-em-manguinhos-na-serra-e-encantador-2417764-article.jpg", type: "NASCER DO SOL", credit: "Reprodução/Instagram/@docemanguinhos" },
          { title: "4- MORRO DO MORENO (VILA VELHA)", image: "https://midias.agazeta.com.br/2024/09/10/o-nascer-do-sol-no-morro-do-moreno-2419702-article.png", type: "NASCER DO SOL", credit: "Reprodução/Instagram/@mariojuniorjo/@cafeoracaomorrodomoreno" },
          { title: "5- FONTE GRANDE (VITÓRIA)", image: "https://midias.agazeta.com.br/2024/09/09/o-por-do-sol-no-parque-da-fonte-grande-e-um-verdadeiro-espetaculo-2417777-article.jpg", type: "PÔR DO SOL", credit: "Reprodução/Instagram/@tavares.expedicoes" },
          { title: "6- ILHA DAS CAIEIRAS (VITÓRIA)", image: "https://midias.agazeta.com.br/2024/09/09/por-do-sol-da-ilha-das-caieiras--2417643-article.jpg", type: "PÔR DO SOL", credit: "Reprodução/Instagram/@vanda_lopes1000" },
          { title: "7- ORLA DE PORTO DE SANTANA (CARIACICA)", image: "https://midias.agazeta.com.br/2024/09/09/a-orla-de-cariacica-e-um-point-para-assistir-o-por-do-sol-2417792-article.jpg", type: "PÔR DO SOL", credit: "Reprodução/Instagram/@rfotosporai/@orladecariacica" },
          { title: "8- CONVENTO DA PENHA (VILA VELHA)", image: "https://midias.agazeta.com.br/2024/09/09/visao-do-convento-da-penha-no-por-do-sol-2417833-article.jpg", type: "PÔR DO SOL", credit: "Reprodução/Instagram/@visaodrone027" },
          { title: "9- BEIRA MAR (VITÓRIA)", image: "https://midias.agazeta.com.br/2024/09/09/por-do-sol-da-baia-de-vitoria-2417644-article.jpg", type: "PÔR DO SOL", credit: "Jansen Dias Lube" },
          { title: "10- MEAÍPE - GUARAPARI", image: "https://midias.agazeta.com.br/2024/09/09/o-por-do-sol-em-meaipe-guarapari-parece-cena-de-filme-2417842-article.jpg", type: "PÔR DO SOL", credit: "Evelize Calmon" }
        ];
        for (const s of initialSunset) {
          await addDoc(collection(db, 'sunset_locations'), s);
        }
      }

      // Seed Moqueca if empty
      if (!moquecaRecipe) {
        const initialMoqueca = {
          title: "Moqueca Capixaba Tradicional",
          description: "A moqueca capixaba é um prato típico do Espírito Santo, preparado sem leite de coco nem dendê...",
          prepTime: "20 min",
          cookTime: "40 min",
          servings: "6 pessoas",
          calories: "320 kcal",
          ingredients: {
            marinade: ["1,2 kg postas de peixe firme", "10 g sal", "5 g pimenta do reino", "40 g suco de limão"],
            cooking: ["80 g azeite de oliva", "40 g azeite de urucum", "300 g cebola", "200 g tomate", "30 g alho", "50 g coentro", "20 g cebolinha"]
          },
          instructions: ["Tempere as postas...", "Aqueça o azeite...", "Frite o alho...", "Coloque as postas...", "Tampe a panela...", "Acrescente o coentro..."],
          notes: ["Tradicionalmente servida com arroz branco e pirão.", "Peixe deve ser fresco.", "Uso da panela de barro é típico."],
          image: "https://th.bing.com/th/id/R.cf064b34bd5a5cec1866ce029cf3de86?rik=W6sqI2x0OZ4uNw&riu=http%3a%2f%2fwww.portaltemponovo.com.br%2fwp-content%2fuploads%2f2015%2f09%2fmoqueca-capixaba1-641.jpg&ehk=GH25fQxmlrMj0zZW%2fHA2IcJXStY7YbH%2bAZLu5Rrt8wM%3d&risl=&pid=ImgRaw&r=0"
        };
        await addDoc(collection(db, 'moqueca_recipe'), initialMoqueca);
      }

      // Seed Experiences if empty
      if (experiences.length === 0) {
        const initialExp = [
          { title: "Moqueca Capixaba", description: "O prato mais famoso do estado.", icon: "Utensils", color: "bg-orange-500" },
          { title: "Passeio de Escuna", description: "Navegue pela baía de Vitória.", icon: "Waves", color: "bg-blue-500" },
          { title: "Pôr do Sol no Canal", description: "Um espetáculo diário.", icon: "Sun", color: "bg-yellow-500" }
        ];
        for (const e of initialExp) {
          await addDoc(collection(db, 'experiences'), e);
        }
      }

      // Seed Hero if empty
      if (!heroData) {
        const initialHero = {
          title: "Descubra a Magia de Vitória",
          subtitle: "Bem-vindo ao Espírito Santo",
          description: "Entre montanhas e o mar, a capital do Espírito Santo guarda segredos históricos...",
          backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/0/03/Convento_da_Penha_e_Terceira_Ponte_com_Mar_e_Vit%C3%B3ria_ao_fundo.jpg"
        };
        await addDoc(collection(db, 'hero_data'), initialHero);
      }

      alert('Banco de dados populado com sucesso!');
      fetchData();
    } catch (error) {
      console.error("Error seeding database:", error);
      alert('Erro ao popular banco de dados.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-stone-100 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-none md:rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-full md:h-auto md:max-h-[800px] flex flex-col md:flex-row overflow-hidden border border-stone-200"
        >
          {/* Image Side */}
          <div className="hidden md:block md:w-1/2 relative">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/03/Convento_da_Penha_e_Terceira_Ponte_com_Mar_e_Vit%C3%B3ria_ao_fundo.jpg" 
              alt="Convento da Penha" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
              <h3 className="text-3xl font-bold text-white mb-2">Convento da Penha</h3>
              <p className="text-white/80 text-sm">O maior símbolo da fé e da história capixaba.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white overflow-y-auto">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-orange-600 p-4 rounded-2xl mb-4 shadow-lg shadow-orange-600/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-stone-900">Acesso Restrito</h2>
              <p className="text-stone-500 text-sm text-center mt-2">Identifique-se para acessar o painel administrativo</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="admin@exemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-red-500 text-sm font-medium text-center">{loginError}</p>
              )}

              <div className="flex flex-col gap-4 pt-2">
                <button 
                  type="submit"
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                >
                  Entrar
                </button>
                <button 
                  type="button"
                  onClick={onExit}
                  className="w-full text-stone-500 font-bold py-2 hover:text-stone-900 transition-colors"
                >
                  Voltar ao Site
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-50 z-[100] overflow-y-auto pb-20">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">Painel Administrativo</h1>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {[
              { id: 'roteiros', label: 'Roteiros', icon: <MapPin className="w-4 h-4" /> },
              { id: 'quickPosts', label: 'Posts', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'sunset', label: 'Sunset', icon: <Sun className="w-4 h-4" /> },
              { id: 'moqueca', label: 'Moqueca', icon: <Utensils className="w-4 h-4" /> },
              { id: 'experiences', label: 'Experiências', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'hero', label: 'Hero', icon: <LayoutGrid className="w-4 h-4" /> },
              { id: 'settings', label: 'Contatos', icon: <Phone className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSeedDatabase}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-orange-600 transition-colors"
            title="Popular banco com dados iniciais"
          >
            <Database className="w-4 h-4" />
            Seed
          </button>
          <div className="w-px h-6 bg-stone-200" />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </header>

      {/* Mobile Tab Nav */}
      <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-2 overflow-x-auto flex gap-2 no-scrollbar">
        {[
          { id: 'roteiros', label: 'Roteiros' },
          { id: 'quickPosts', label: 'Posts' },
          { id: 'sunset', label: 'Sunset' },
          { id: 'moqueca', label: 'Moqueca' },
          { id: 'experiences', label: 'Exp' },
          { id: 'hero', label: 'Hero' },
          { id: 'settings', label: 'Contatos' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'text-stone-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-12">
        {activeTab === 'roteiros' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-600" /> Gerenciar Roteiros
              </h2>
              <button 
                onClick={() => setEditingRoteiro({ title: '', subtitle: '', price: '', images: [], places: [], history: '', gastronomy: '', curiosities: '', courtesy: [], flyer: '', timeDeparture: '', timeReturn: '' })}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
              >
                <Plus className="w-5 h-5" /> Novo Roteiro
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roteiros.map(roteiro => (
                <div key={roteiro.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 group">
                  <div className="h-48 relative bg-stone-100">
                    <img 
                      src={roteiro.images[0]} 
                      alt={roteiro.title} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => setEditingRoteiro(roteiro)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-orange-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRoteiro(roteiro.id)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1 block">{roteiro.subtitle}</span>
                    <h3 className="font-bold text-stone-900 mb-2">{roteiro.title}</h3>
                    <div className="flex items-center gap-2 mb-3 text-stone-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {roteiro.timeDeparture && roteiro.timeReturn 
                          ? `Ida: ${roteiro.timeDeparture} | Volta: ${roteiro.timeReturn}`
                          : roteiro.time || 'Horário não definido'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 line-clamp-2 mb-4">{roteiro.history}</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">Geral:</span>
                        <span className="font-bold text-stone-900">R$ {roteiro.price}</span>
                      </div>
                      {roteiro.priceCash && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-400">À Vista:</span>
                          <span className="font-bold text-green-600 text-sm">R$ {roteiro.priceCash}</span>
                        </div>
                      )}
                      {roteiro.priceInstallment && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-400">Parcelado:</span>
                          <span className="font-bold text-orange-600 text-sm">R$ {roteiro.priceInstallment}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-end mt-2">
                        <span className="text-[10px] text-stone-400 uppercase font-bold">{roteiro.places.length} locais</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'quickPosts' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-orange-600" /> Posts Rápidos
              </h2>
              <button 
                onClick={() => setEditingQuickPost({ image: '', description: '', comment: '' })}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
              >
                <Plus className="w-5 h-5" /> Novo Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickPosts.map(post => (
                <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 group">
                  <div className="aspect-square relative bg-stone-100">
                    <img 
                      src={post.image} 
                      alt={post.description} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => setEditingQuickPost(post)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-orange-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuickPost(post.id)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-stone-900 line-clamp-1">{post.description}</p>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 italic">"{post.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'sunset' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Sun className="w-6 h-6 text-orange-600" /> Guia do Pôr do Sol
              </h2>
              <button 
                onClick={() => setEditingSunset({ title: '', image: '', type: 'NASCER DO SOL', credit: '' })}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
              >
                <Plus className="w-5 h-5" /> Novo Local
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sunsetLocations.map(loc => (
                <div key={loc.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 group">
                  <div className="aspect-video relative bg-stone-100">
                    <img src={loc.image} alt={loc.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => setEditingSunset(loc)} className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-orange-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteSunset(loc.id)} className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-widest ${loc.type === 'NASCER DO SOL' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        {loc.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-stone-900 text-sm">{loc.title}</h3>
                    <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mt-1">Crédito: {loc.credit}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'moqueca' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-orange-600" /> Receita da Moqueca
              </h2>
              <button 
                onClick={() => setEditingMoqueca(moquecaRecipe || { title: '', description: '', prepTime: '', cookTime: '', servings: '', calories: '', ingredients: { marinade: [], cooking: [] }, instructions: [], notes: [], image: '' })}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
              >
                <Edit className="w-5 h-5" /> Editar Receita
              </button>
            </div>

            {moquecaRecipe ? (
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-stone-200 flex flex-col md:flex-row">
                <div className="md:w-1/3 aspect-square md:aspect-auto relative">
                  <img src={moquecaRecipe.image} alt={moquecaRecipe.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="md:w-2/3 p-8 md:p-12">
                  <h3 className="text-3xl font-bold text-stone-900 mb-4">{moquecaRecipe.title}</h3>
                  <p className="text-stone-500 mb-8 line-clamp-3 italic">"{moquecaRecipe.description}"</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Preparo</p>
                      <p className="font-bold text-stone-900">{moquecaRecipe.prepTime}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Cozimento</p>
                      <p className="font-bold text-stone-900">{moquecaRecipe.cookTime}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Porções</p>
                      <p className="font-bold text-stone-900">{moquecaRecipe.servings}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Calorias</p>
                      <p className="font-bold text-stone-900">{moquecaRecipe.calories}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
                <p className="text-stone-400 font-medium">Nenhuma receita cadastrada.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'experiences' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-600" /> Experiências
              </h2>
              <button 
                onClick={() => setEditingExperience({ title: '', description: '', icon: 'Sparkles', color: 'bg-orange-500' })}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
              >
                <Plus className="w-5 h-5" /> Nova Experiência
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map(exp => (
                <div key={exp.id} className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingExperience(exp)} className="p-2 text-stone-400 hover:text-orange-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteExperience(exp.id)} className="p-2 text-stone-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className={`w-12 h-12 ${exp.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{exp.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'hero' && (
          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-orange-600" /> Seção Hero (Início)
            </h2>
            
            {heroData ? (
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-stone-200">
                <div className="h-64 relative">
                  <img src={heroData.backgroundImage} alt="Hero Background" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-8">
                    <div>
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">{heroData.subtitle}</span>
                      <h3 className="text-4xl font-bold text-white mb-4">{heroData.title}</h3>
                      <p className="text-white/80 text-sm max-w-xl mx-auto line-clamp-2">{heroData.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingHero(heroData)}
                    className="absolute bottom-6 right-6 bg-white text-stone-900 px-6 py-3 rounded-xl font-bold hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2 shadow-xl"
                  >
                    <Edit className="w-4 h-4" /> Editar Hero
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
                <button onClick={() => setEditingHero({ title: '', subtitle: '', description: '', backgroundImage: '' })} className="text-orange-600 font-bold">Configurar Hero</button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'settings' && (
          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Phone className="w-6 h-6 text-orange-600" /> Contatos e Mídias
            </h2>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">WhatsApp</label>
                <input 
                  type="text" 
                  value={contactInfo.whatsapp}
                  onChange={e => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="5527999999999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Instagram (URL)</label>
                <input 
                  type="text" 
                  value={contactInfo.instagram}
                  onChange={e => setContactInfo({...contactInfo, instagram: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Facebook (URL)</label>
                <input 
                  type="text" 
                  value={contactInfo.facebook}
                  onChange={e => setContactInfo({...contactInfo, facebook: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</label>
                <input 
                  type="email" 
                  value={contactInfo.email}
                  onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="contato@exemplo.com"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Salvar Configurações
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRoteiro && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingRoteiro(null)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900"
              >
                <X className="w-8 h-8" />
              </button>

              <h3 className="text-3xl font-bold text-stone-900 mb-8">
                {editingRoteiro.id ? 'Editar Roteiro' : 'Novo Roteiro'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Título do Roteiro</label>
                    <input 
                      type="text" 
                      value={editingRoteiro.title}
                      onChange={e => setEditingRoteiro({...editingRoteiro, title: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Subtítulo (Ex: Roteiro 1)</label>
                    <input 
                      type="text" 
                      value={editingRoteiro.subtitle}
                      onChange={e => setEditingRoteiro({...editingRoteiro, subtitle: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Preço Geral (R$)</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.price}
                        onChange={e => setEditingRoteiro({...editingRoteiro, price: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 450,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Horário de Ida</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.timeDeparture || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, timeDeparture: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 08:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Horário de Volta</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.timeReturn || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, timeReturn: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 16:00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Valor à Vista (R$)</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.priceCash || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, priceCash: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 400,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Valor Parcelado (R$)</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.priceInstallment || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, priceInstallment: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 12x de 45,00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagens</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        {editingRoteiro.images?.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 group">
                            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleDownload(img, `roteiro-img-${idx}.jpg`)}
                                className="bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full backdrop-blur-sm"
                                title="Baixar Imagem"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => setEditingRoteiro({...editingRoteiro, images: editingRoteiro.images?.filter((_, i) => i !== idx)})}
                                className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-sm"
                                title="Excluir Imagem"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                          {uploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                              <Loader2 className="w-6 h-6 text-orange-600 animate-spin mb-1" />
                              <span className="text-[8px] font-bold text-orange-600">{Math.round(uploadProgress)}%</span>
                              <div className="absolute bottom-0 left-0 h-1 bg-orange-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-stone-400" />
                              <span className="text-[8px] font-bold text-stone-400 uppercase mt-1">Upload</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file, 'roteiros');
                                setEditingRoteiro({...editingRoteiro, images: [...(editingRoteiro.images || []), url]});
                              }
                            }}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <textarea 
                        value={editingRoteiro.images?.join('\n')}
                        onChange={e => setEditingRoteiro({...editingRoteiro, images: e.target.value.split('\n').filter(l => l.trim())})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24 text-xs"
                        placeholder="Ou cole as URLs das imagens (uma por linha)"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Flyer (Imagem do Roteiro)</label>
                    <div className="flex gap-4">
                      <label className="flex-1 h-12 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                        {uploading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                            <Loader2 className="w-4 h-4 text-orange-600 animate-spin mb-1" />
                            <span className="text-[8px] font-bold text-orange-600">{Math.round(uploadProgress)}%</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-stone-400" />
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Upload Flyer</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'flyers');
                              setEditingRoteiro({...editingRoteiro, flyer: url});
                            }
                          }}
                          disabled={uploading}
                        />
                      </label>
                      {editingRoteiro.flyer && (
                        <button 
                          onClick={() => handleDownload(editingRoteiro.flyer!, 'flyer.jpg')}
                          className="w-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:text-orange-600 hover:border-orange-200 transition-all"
                          title="Baixar Flyer Atual"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                      <input 
                        type="text" 
                        value={editingRoteiro.flyer || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, flyer: e.target.value})}
                        className="flex-[2] p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs"
                        placeholder="Ou cole a URL do flyer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Locais Visitados (Um por linha)</label>
                    <textarea 
                      value={editingRoteiro.places?.join('\n')}
                      onChange={e => setEditingRoteiro({...editingRoteiro, places: e.target.value.split('\n').filter(l => l.trim())})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Cortesias (Uma por linha)</label>
                    <textarea 
                      value={editingRoteiro.courtesy?.join('\n')}
                      onChange={e => setEditingRoteiro({...editingRoteiro, courtesy: e.target.value.split('\n').filter(l => l.trim())})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">História</label>
                    <textarea 
                      value={editingRoteiro.history}
                      onChange={e => setEditingRoteiro({...editingRoteiro, history: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Gastronomia</label>
                    <textarea 
                      value={editingRoteiro.gastronomy}
                      onChange={e => setEditingRoteiro({...editingRoteiro, gastronomy: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Curiosidades</label>
                    <textarea 
                      value={editingRoteiro.curiosities}
                      onChange={e => setEditingRoteiro({...editingRoteiro, curiosities: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingRoteiro(null)}
                  className="px-8 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveRoteiro}
                  className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                >
                  Salvar Roteiro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Post Edit Modal */}
      <AnimatePresence>
        {editingQuickPost && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 md:p-12 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingQuickPost(null)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900"
              >
                <X className="w-8 h-8" />
              </button>

              <h3 className="text-3xl font-bold text-stone-900 mb-8">
                {editingQuickPost.id ? 'Editar Post' : 'Novo Post Rápido'}
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Foto do Post</label>
                  <div className="flex flex-col gap-4">
                    {editingQuickPost.image && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
                        <img src={editingQuickPost.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => handleDownload(editingQuickPost.image!, 'post-image.jpg')}
                            className="bg-white/90 backdrop-blur-sm text-stone-600 p-2 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                            title="Baixar Imagem"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setEditingQuickPost({...editingQuickPost, image: ''})}
                            className="bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                            title="Remover Imagem"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <label className="flex-1 h-16 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-3 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                        {uploading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                              <span className="text-xs font-bold text-orange-600">{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-24 h-1 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-stone-400" />
                            <span className="text-xs font-bold text-stone-400 uppercase">Fazer Upload</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'quick_posts');
                              setEditingQuickPost({...editingQuickPost, image: url});
                            }
                          }}
                          disabled={uploading}
                        />
                      </label>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={editingQuickPost.image}
                          onChange={e => setEditingQuickPost({...editingQuickPost, image: e.target.value})}
                          className="w-full h-16 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                          placeholder="Ou cole a URL da foto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Descrição</label>
                  <input 
                    type="text" 
                    value={editingQuickPost.description}
                    onChange={e => setEditingQuickPost({...editingQuickPost, description: e.target.value})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Ex: Passeio de Escuna em Guarapari"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Comentário</label>
                  <textarea 
                    value={editingQuickPost.comment}
                    onChange={e => setEditingQuickPost({...editingQuickPost, comment: e.target.value})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32"
                    placeholder="Ex: Um dia inesquecível com águas cristalinas!"
                  />
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingQuickPost(null)}
                  className="px-8 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveQuickPost}
                  className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                >
                  Salvar Post
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingSunset && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 md:p-12 shadow-2xl relative">
              <button onClick={() => setEditingSunset(null)} className="absolute top-8 right-8 text-stone-400"><X className="w-8 h-8" /></button>
              <h3 className="text-3xl font-bold text-stone-900 mb-8">{editingSunset.id ? 'Editar Local' : 'Novo Local do Sol'}</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Título</label>
                  <input type="text" value={editingSunset.title} onChange={e => setEditingSunset({...editingSunset, title: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tipo</label>
                  <select value={editingSunset.type} onChange={e => setEditingSunset({...editingSunset, type: e.target.value as any})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="NASCER DO SOL">NASCER DO SOL</option>
                    <option value="PÔR DO SOL">PÔR DO SOL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Crédito da Foto</label>
                  <input type="text" value={editingSunset.credit} onChange={e => setEditingSunset({...editingSunset, credit: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagem (URL ou Upload)</label>
                  <div className="flex gap-4">
                    <label className="flex-1 h-12 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                      {uploading ? <Loader2 className="w-4 h-4 text-orange-600 animate-spin" /> : <><Upload className="w-4 h-4 text-stone-400" /><span className="text-[10px] font-bold text-stone-400 uppercase">Upload</span></>}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file, 'sunset');
                          setEditingSunset({...editingSunset, image: url});
                        }
                      }} disabled={uploading} />
                    </label>
                    <input type="text" value={editingSunset.image} onChange={e => setEditingSunset({...editingSunset, image: e.target.value})} className="flex-[2] p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs" placeholder="URL da imagem" />
                  </div>
                </div>
              </div>
              <div className="mt-12 flex justify-end gap-4">
                <button onClick={() => setEditingSunset(null)} className="px-8 py-4 rounded-2xl font-bold text-stone-500">Cancelar</button>
                <button onClick={handleSaveSunset} className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 shadow-xl">Salvar</button>
              </div>
            </motion.div>
          </div>
        )}

        {editingExperience && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 md:p-12 shadow-2xl relative">
              <button onClick={() => setEditingExperience(null)} className="absolute top-8 right-8 text-stone-400"><X className="w-8 h-8" /></button>
              <h3 className="text-3xl font-bold text-stone-900 mb-8">{editingExperience.id ? 'Editar Experiência' : 'Nova Experiência'}</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Título</label>
                  <input type="text" value={editingExperience.title} onChange={e => setEditingExperience({...editingExperience, title: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Descrição</label>
                  <textarea value={editingExperience.description} onChange={e => setEditingExperience({...editingExperience, description: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Cor de Fundo (Tailwind Class)</label>
                  <input type="text" value={editingExperience.color} onChange={e => setEditingExperience({...editingExperience, color: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: bg-orange-500" />
                </div>
              </div>
              <div className="mt-12 flex justify-end gap-4">
                <button onClick={() => setEditingExperience(null)} className="px-8 py-4 rounded-2xl font-bold text-stone-500">Cancelar</button>
                <button onClick={handleSaveExperience} className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 shadow-xl">Salvar</button>
              </div>
            </motion.div>
          </div>
        )}

        {editingMoqueca && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl relative">
              <button onClick={() => setEditingMoqueca(null)} className="absolute top-8 right-8 text-stone-400"><X className="w-8 h-8" /></button>
              <h3 className="text-3xl font-bold text-stone-900 mb-8">Editar Receita da Moqueca</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Título</label>
                    <input type="text" value={editingMoqueca.title} onChange={e => setEditingMoqueca({...editingMoqueca, title: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Descrição</label>
                    <textarea value={editingMoqueca.description} onChange={e => setEditingMoqueca({...editingMoqueca, description: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Preparo</label><input type="text" value={editingMoqueca.prepTime} onChange={e => setEditingMoqueca({...editingMoqueca, prepTime: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Cozimento</label><input type="text" value={editingMoqueca.cookTime} onChange={e => setEditingMoqueca({...editingMoqueca, cookTime: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Porções</label><input type="text" value={editingMoqueca.servings} onChange={e => setEditingMoqueca({...editingMoqueca, servings: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Calorias</label><input type="text" value={editingMoqueca.calories} onChange={e => setEditingMoqueca({...editingMoqueca, calories: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagem (URL ou Upload)</label>
                    <div className="flex gap-4">
                      <label className="flex-1 h-12 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                        {uploading ? <Loader2 className="w-4 h-4 text-orange-600 animate-spin" /> : <><Upload className="w-4 h-4 text-stone-400" /><span className="text-[10px] font-bold text-stone-400 uppercase">Upload</span></>}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file, 'moqueca');
                            setEditingMoqueca({...editingMoqueca, image: url});
                          }
                        }} disabled={uploading} />
                      </label>
                      <input type="text" value={editingMoqueca.image} onChange={e => setEditingMoqueca({...editingMoqueca, image: e.target.value})} className="flex-[2] p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs" placeholder="URL da imagem" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ingredientes - Marinada (Um por linha)</label>
                    <textarea value={editingMoqueca.ingredients.marinade.join('\n')} onChange={e => setEditingMoqueca({...editingMoqueca, ingredients: {...editingMoqueca.ingredients, marinade: e.target.value.split('\n').filter(l => l.trim())}})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ingredientes - Cozimento (Um por linha)</label>
                    <textarea value={editingMoqueca.ingredients.cooking.join('\n')} onChange={e => setEditingMoqueca({...editingMoqueca, ingredients: {...editingMoqueca.ingredients, cooking: e.target.value.split('\n').filter(l => l.trim())}})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Instruções (Uma por linha)</label>
                    <textarea value={editingMoqueca.instructions.join('\n')} onChange={e => setEditingMoqueca({...editingMoqueca, instructions: e.target.value.split('\n').filter(l => l.trim())})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32" />
                  </div>
                </div>
              </div>
              <div className="mt-12 flex justify-end gap-4">
                <button onClick={() => setEditingMoqueca(null)} className="px-8 py-4 rounded-2xl font-bold text-stone-500">Cancelar</button>
                <button onClick={handleSaveMoqueca} className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 shadow-xl">Salvar Receita</button>
              </div>
            </motion.div>
          </div>
        )}

        {editingHero && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 md:p-12 shadow-2xl relative">
              <button onClick={() => setEditingHero(null)} className="absolute top-8 right-8 text-stone-400"><X className="w-8 h-8" /></button>
              <h3 className="text-3xl font-bold text-stone-900 mb-8">Editar Seção Hero</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Título Principal</label>
                  <input type="text" value={editingHero.title} onChange={e => setEditingHero({...editingHero, title: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Subtítulo</label>
                  <input type="text" value={editingHero.subtitle} onChange={e => setEditingHero({...editingHero, subtitle: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Descrição</label>
                  <textarea value={editingHero.description} onChange={e => setEditingHero({...editingHero, description: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagem de Fundo (URL ou Upload)</label>
                  <div className="flex gap-4">
                    <label className="flex-1 h-12 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                      {uploading ? <Loader2 className="w-4 h-4 text-orange-600 animate-spin" /> : <><Upload className="w-4 h-4 text-stone-400" /><span className="text-[10px] font-bold text-stone-400 uppercase">Upload</span></>}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file, 'hero');
                          setEditingHero({...editingHero, backgroundImage: url});
                        }
                      }} disabled={uploading} />
                    </label>
                    <input type="text" value={editingHero.backgroundImage} onChange={e => setEditingHero({...editingHero, backgroundImage: e.target.value})} className="flex-[2] p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs" placeholder="URL da imagem" />
                  </div>
                </div>
              </div>
              <div className="mt-12 flex justify-end gap-4">
                <button onClick={() => setEditingHero(null)} className="px-8 py-4 rounded-2xl font-bold text-stone-500">Cancelar</button>
                <button onClick={handleSaveHero} className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 shadow-xl">Salvar Hero</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
