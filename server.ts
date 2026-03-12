import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("app.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS roteiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    subtitle TEXT,
    price TEXT,
    timeDeparture TEXT,
    timeReturn TEXT,
    images TEXT,
    places TEXT,
    courtesy TEXT,
    history TEXT,
    gastronomy TEXT,
    curiosities TEXT
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const INITIAL_ROTEIROS = [
  {
    title: "Praias de Guarapari",
    subtitle: "ROTEIRO 1",
    price: "450,00",
    timeDeparture: "08:00",
    timeReturn: "16:00",
    images: ["https://prefiroguarapari.com.br/wp-content/uploads/2024/08/praia-do-morro-em-guarapari.jpg", "https://terracapixaba.com/wp-content/uploads/2023/12/praia-de-peracanga-enseada-azul-guarapari-1-1.webp", "https://www.guiaviagensbrasil.com/imagens/foto-praia-castanheiras-guarapari-es.jpg"],
    places: ["Praia de Setiba", "Praia do Morro", "Praia da Areia Preta", "Praia das Castanheiras"],
    courtesy: ["Cadeiras de praia", "Guara Sol", "Caixa Térmica"],
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
    images: ["https://www.correiobraziliense.com.br/aqui/wp-content/uploads/2025/08/1280px-Pedra_Azul_006.jpg", "https://th.bing.com/th/id/OIP.AMFkZfcV0hMHbAbBYPdt0QHaE8?w=279&h=186&c=7&r=0&o=7&pid=1.7&rm=3"],
    places: ["Parque da Pedra Azul", "Quadrado de São Paulinho", "Cervejaria Ronchi", "Biscoite Kebis", "Igreja Luterana", "Museu do Colono", "Rua do Laser", "Cervejaria Barba Ruiva", "Portal da Cidade"],
    courtesy: [],
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
    images: ["https://www.neosenses.com.br/wp-content/uploads/2021/04/88e258d8-12d9-4857-b339-76bef25163c8.jpg"],
    places: ["Buda Gigante", "Biscoito Claid's", "Museu Melo Leitão", "Vinícola Mattiello", "Cantinas Italianas", "Casa Lambert", "Pepe Chocolate", "Cervejarias Artesanais"],
    courtesy: [],
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
    images: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/c8/71/f4/photo0jpg.jpg?w=1000&h=-1&s=1"],
    places: ["Enseada do Suá", "Ilha do Frade", "Ilha do Boi", "Paneleiras", "Forte São João", "Catedral Metropolitana", "Palácio do Governo", "Orla Praia da Costa", "Praia Secreta", "Farol de Santa Luzia", "Convento da Penha", "Chocolate Garoto"],
    courtesy: [],
    history: "Vila Velha é a cidade mais antiga do estado, fundada em 1535. O Convento da Penha, erguido em 1558, é um dos santuários marianos mais antigos e importantes do Brasil.",
    gastronomy: "A Torta Capixaba é a estrela, especialmente na Semana Santa. Em Vila Velha, a visita à fábrica de chocolates Garoto é uma experiência doce imperdível.",
    curiosities: "As Paneleiras de Goiabeiras mantêm uma tradição de mais de 400 anos na fabricação de panelas de barro, técnica essencial para a verdadeira Moqueca Capixaba."
  }
];

const roteirosCount = db.prepare("SELECT COUNT(*) as count FROM roteiros").get() as { count: number };
if (roteirosCount.count === 0) {
  const insert = db.prepare("INSERT INTO roteiros (title, subtitle, price, timeDeparture, timeReturn, images, places, courtesy, history, gastronomy, curiosities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const r of INITIAL_ROTEIROS) {
    insert.run(r.title, r.subtitle, r.price, r.timeDeparture, r.timeReturn, JSON.stringify(r.images), JSON.stringify(r.places), JSON.stringify(r.courtesy), r.history, r.gastronomy, r.curiosities);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Auth endpoint
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (email === "fabio.fernandes@city.com" && password === "745896321") {
      res.json({ token: "admin-token-vixes" });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  const requireAuth = (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer admin-token-vixes") {
      next();
    } else {
      res.status(401).json({ error: "Não autorizado" });
    }
  };

  // Roteiros endpoints
  app.get("/api/roteiros", (req, res) => {
    const rows = db.prepare("SELECT * FROM roteiros").all();
    const roteiros = rows.map((row: any) => ({
      ...row,
      images: JSON.parse(row.images || "[]"),
      places: JSON.parse(row.places || "[]"),
      courtesy: JSON.parse(row.courtesy || "[]")
    }));
    res.json(roteiros);
  });

  app.post("/api/roteiros", requireAuth, (req, res) => {
    const { title, subtitle, price, timeDeparture, timeReturn, images, places, courtesy, history, gastronomy, curiosities } = req.body;
    const stmt = db.prepare("INSERT INTO roteiros (title, subtitle, price, timeDeparture, timeReturn, images, places, courtesy, history, gastronomy, curiosities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const info = stmt.run(title, subtitle, price, timeDeparture, timeReturn, JSON.stringify(images||[]), JSON.stringify(places||[]), JSON.stringify(courtesy||[]), history, gastronomy, curiosities);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/roteiros/:id", requireAuth, (req, res) => {
    const { title, subtitle, price, timeDeparture, timeReturn, images, places, courtesy, history, gastronomy, curiosities } = req.body;
    const stmt = db.prepare("UPDATE roteiros SET title=?, subtitle=?, price=?, timeDeparture=?, timeReturn=?, images=?, places=?, courtesy=?, history=?, gastronomy=?, curiosities=? WHERE id=?");
    stmt.run(title, subtitle, price, timeDeparture, timeReturn, JSON.stringify(images||[]), JSON.stringify(places||[]), JSON.stringify(courtesy||[]), history, gastronomy, curiosities, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/roteiros/:id", requireAuth, (req, res) => {
    db.prepare("DELETE FROM roteiros WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  // Gallery endpoints
  app.get("/api/gallery", (req, res) => {
    const rows = db.prepare("SELECT * FROM gallery ORDER BY createdAt DESC").all();
    res.json(rows);
  });

  app.post("/api/gallery", requireAuth, (req, res) => {
    const { url } = req.body;
    const stmt = db.prepare("INSERT INTO gallery (url) VALUES (?)");
    const info = stmt.run(url);
    res.json({ id: info.lastInsertRowid, url });
  });

  app.delete("/api/gallery/:id", requireAuth, (req, res) => {
    db.prepare("DELETE FROM gallery WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
