import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "./currency";

export type Lang = "fr" | "en" | "pt" | "id" | "es";

export const LANGS: Record<Lang, { name: string; native: string; flag: string }> = {
  fr: { name: "French", native: "Français", flag: "🇫🇷" },
  en: { name: "English", native: "English", flag: "🇺🇸" },
  pt: { name: "Portuguese", native: "Português", flag: "🇧🇷" },
  id: { name: "Indonesian", native: "Bahasa", flag: "🇮🇩" },
  es: { name: "Spanish", native: "Español", flag: "🇪🇸" },
};

// Sensible default language per currency. Users can override.
export const CURRENCY_TO_LANG: Record<CurrencyCode, Lang> = {
  USD: "en",
  GBP: "en",
  EUR: "fr",
  XOF: "fr",
  NGN: "en",
  BRL: "pt",
  IDR: "id",
  INR: "en",
};

type Dict = Record<string, string>;

const fr: Dict = {
  "nav.open_app": "Ouvrir l'app",
  "badge.launch": "Ouverture — 1er août",
  "badge.live": "En ligne — accès libre",
  "badge.prelaunch": "Pré-lancement",
  "hero.title.a": "L'IA sans t'abonner",
  "hero.title.b": "à ce que tu n'utilises pas.",
  "hero.subtitle":
    "Un accès unique aux meilleurs modèles — Kling, Seedance, Nano Banana, GPT-5, Claude, ElevenLabs — facturé à la génération. Payable en Mobile Money, carte, crypto ou Alipay. Où que tu crées.",

  "stat.models": "modèles",
  "stat.currencies": "devises",
  "stat.no_sub": "sans abo",

  "waitlist.title": "Rejoindre la waitlist",
  "waitlist.email_placeholder": "ton@email.com",
  "waitlist.cta": "Je réserve ma place",
  "waitlist.i_create": "Je crée surtout :",
  "waitlist.no_spam":
    "Zéro spam. On t'écrit une fois pour te dire que c'est ouvert, une seconde pour t'offrir tes premiers crédits.",
  "waitlist.done": "Tu es dedans.",
  "waitlist.your_seat": "Ta place",
  "waitlist.referral": "Ton lien de parrainage",
  "waitlist.copy": "Copier",
  "waitlist.copied": "Copié",
  "waitlist.friends_invited": "amis invités",
  "waitlist.launch_email":
    "On t'écrit le 1er août avec ton accès. D'ici là, surveille ta boîte et ta place dans la file — elle bouge à chaque nouvel inscrit.",

  "sim.eyebrow": "Combien tu paierais",
  "sim.title.a": "Tape ton usage. Vois le prix.",
  "sim.title.b": "Pas l'inverse.",
  "sim.subtitle":
    "Les autres te vendent un forfait, puis te disent « attention aux limites ». Ici, tu paies exactement ce que tu utilises — à la seconde de vidéo, au caractère de voix, au token.",
  "sim.eyebrow_card": "Simulateur",
  "sim.compose": "Compose ton mois type.",
  "sim.your_month": "Ton mois avec Cortexia",
  "sim.charged": "Facturé à la génération. Pas de mensualité fixe.",
  "sim.classic": "Avec un abonnement classique",
  "sim.you_save": "Tu économises",
  "sim.this_month": "ce mois-ci.",
  "sim.threshold_note":
    "À ce volume, un abonnement classique commence à être compétitif — mais tu ne payes toujours que ce que tu utilises, sans engagement, sans risque de payer pour rien un mois plus creux.",
  "sim.close_note":
    "Tu approches du seuil où un abonnement fixe redevient intéressant. Reste en usage tant que ton volume varie.",
  "sim.threshold_marker": "seuil abonnement",

  "wall.eyebrow": "Ce que Cortexia crée",
  "wall.title": "Le vrai bench, c'est ce qui sort.",
  "wall.subtitle":
    "Chaque case ci-dessous est un rendu réel d'un modèle du catalogue. Filtre par type ou par cas d'usage, ouvre pour voir le prompt.",
  "wall.filters.all": "Tout",
  "wall.filters.image": "Image",
  "wall.filters.video": "Vidéo",
  "wall.filters.music": "Musique",
  "wall.filters.voice": "Voix",
  "wall.usecase.all": "Tous les usages",
  "wall.usecase.ad": "Pub",
  "wall.usecase.ugc": "UGC",
  "wall.usecase.show": "Émission",
  "wall.usecase.film": "Film",
  "wall.load_more": "Voir plus de créations",
  "wall.modal.prompt": "Prompt utilisé",
  "wall.modal.cta": "Crée le tien",
  "wall.modal.model": "Généré avec",

  "compare.eyebrow": "Le vrai calcul",
  "compare.title.a": "Ce que tu paies vraiment,",
  "compare.title.b": "pas ce qu'on te promet.",
  "compare.old.subtitle": "Abonnements empilés",
  "compare.old.title": "L'ancien modèle",
  "compare.old.note": "Même si tu ne génères rien ce mois-ci.",
  "compare.new.subtitle": "À l'usage, sans forfait",
  "compare.new.title": "Cortexia",
  "compare.new.note": "Tu n'as rien à payer les jours creux.",
  "compare.total": "Total mensuel",

  "social.eyebrow": "Ils attendent déjà",
  "social.copy":
    "créateurs inscrits, de Lomé à Jakarta en passant par São Paulo et Paris. Le premier accès se fait par ordre d'inscription — le parrainage fait remonter.",

  "faq.eyebrow": "Ce qu'on nous demande",
  "faq.title": "Questions honnêtes.",

  "footer.copy": "© 2026 — construit pour les créateurs, partout.",
  "footer.policy": "Politique",
  "footer.contact": "Contact",
  "footer.team": "Accès équipe",

  // App
  "app.nav.agent": "Agent",
  "app.nav.models": "Modèles",
  "app.nav.history": "Historique",
  "app.nav.dev": "Développeur",
  "app.nav.account": "Compte",
  "app.header.balance": "Solde",
  "app.header.help": "Revoir l'accueil",
  "app.header.internal": "Preview interne",

  "app.agent.hello": "Dis-moi ce que tu veux créer.",
  "app.agent.hello_sub":
    "Je choisis le meilleur modèle, tu gardes la main. Chaque génération est facturée exactement au coût affiché.",
  "app.agent.starters_title": "Pour démarrer",
  "app.agent.decision_lead": "Choisi pour toi",
  "app.agent.decision_alt": "Autres options",
  "app.agent.refine": "Affiner",
  "app.agent.regenerate": "Régénérer",
  "app.agent.download": "Télécharger",
  "app.agent.result_ready": "Résultat prêt",

  "app.onb.step1.title": "Un agent qui choisit le bon modèle.",
  "app.onb.step1.body":
    "Dis ce que tu veux — image, vidéo, voix, texte. Cortexia route ton prompt vers le meilleur modèle du catalogue et t'explique pourquoi.",
  "app.onb.step2.title": "Un playground par modèle.",
  "app.onb.step2.body":
    "Besoin de contrôle fin ? Va directement dans le catalogue et choisis ton modèle. Chaque page a son formulaire dédié et son prix live.",
  "app.onb.step3.title": "Zéro abonnement. Zéro surprise.",
  "app.onb.step3.body":
    "Le prix s'affiche avant chaque génération. Tu recharges ce que tu veux — Mobile Money, carte, crypto, Alipay — et tu repars quand tu veux.",
  "app.onb.next": "Suivant",
  "app.onb.skip": "Passer",
  "app.onb.done": "Commencer à créer",
  "app.onb.welcome_credit": "5 $ de crédits offerts déposés sur ton compte.",
};

const en: Dict = {
  "nav.open_app": "Open app",
  "badge.launch": "Launching — August 1st",
  "badge.live": "Live — open access",
  "badge.prelaunch": "Pre-launch",
  "hero.title.a": "AI without subscribing",
  "hero.title.b": "to things you never use.",
  "hero.subtitle":
    "One entry point to the best models — Kling, Seedance, Nano Banana, GPT-5, Claude, ElevenLabs — billed per generation. Pay with Mobile Money, card, crypto or Alipay. Wherever you create.",

  "stat.models": "models",
  "stat.currencies": "currencies",
  "stat.no_sub": "no sub",

  "waitlist.title": "Join the waitlist",
  "waitlist.email_placeholder": "you@email.com",
  "waitlist.cta": "Save my spot",
  "waitlist.i_create": "I mostly create:",
  "waitlist.no_spam":
    "Zero spam. One email when we open, a second one to hand you your first credits.",
  "waitlist.done": "You're in.",
  "waitlist.your_seat": "Your spot",
  "waitlist.referral": "Your referral link",
  "waitlist.copy": "Copy",
  "waitlist.copied": "Copied",
  "waitlist.friends_invited": "friends invited",
  "waitlist.launch_email":
    "We'll email you on August 1st with your access. Meanwhile watch your inbox and your spot — it moves with every new signup.",

  "sim.eyebrow": "What you'd actually pay",
  "sim.title.a": "Type your usage. See the price.",
  "sim.title.b": "Not the other way around.",
  "sim.subtitle":
    'The others sell you a plan, then tell you to "watch the limits". Here, you pay exactly what you use — per second of video, per character of voice, per token.',
  "sim.eyebrow_card": "Simulator",
  "sim.compose": "Compose your typical month.",
  "sim.your_month": "Your month with Cortexia",
  "sim.charged": "Charged per generation. No fixed monthly fee.",
  "sim.classic": "With a classic subscription",
  "sim.you_save": "You save",
  "sim.this_month": "this month.",
  "sim.threshold_note":
    "At this volume, a classic subscription starts to be competitive — but you still only pay what you use, with no commitment and no risk of paying for a quiet month.",
  "sim.close_note":
    "You're approaching the point where a flat subscription becomes worth it. Stay pay-as-you-go while your volume varies.",
  "sim.threshold_marker": "subscription break-even",

  "wall.eyebrow": "What Cortexia makes",
  "wall.title": "The real benchmark is what comes out.",
  "wall.subtitle":
    "Every tile below is a real output from a catalog model. Filter by type or use case, tap to see the prompt.",
  "wall.filters.all": "All",
  "wall.filters.image": "Image",
  "wall.filters.video": "Video",
  "wall.filters.music": "Music",
  "wall.filters.voice": "Voice",
  "wall.usecase.all": "All use cases",
  "wall.usecase.ad": "Ads",
  "wall.usecase.ugc": "UGC",
  "wall.usecase.show": "Show",
  "wall.usecase.film": "Film",
  "wall.load_more": "See more creations",
  "wall.modal.prompt": "Prompt used",
  "wall.modal.cta": "Make your own",
  "wall.modal.model": "Generated with",

  "compare.eyebrow": "The real math",
  "compare.title.a": "What you actually pay,",
  "compare.title.b": "not what you're promised.",
  "compare.old.subtitle": "Stacked subscriptions",
  "compare.old.title": "The old way",
  "compare.old.note": "Even on months you don't generate anything.",
  "compare.new.subtitle": "Pay-as-you-go, no plan",
  "compare.new.title": "Cortexia",
  "compare.new.note": "Nothing to pay on quiet days.",
  "compare.total": "Monthly total",

  "social.eyebrow": "They're already waiting",
  "social.copy":
    "creators signed up, from Lomé to Jakarta via São Paulo and Paris. First access is by signup order — referrals move you up.",

  "faq.eyebrow": "What you keep asking",
  "faq.title": "Straight answers.",

  "footer.copy": "© 2026 — built for creators, everywhere.",
  "footer.policy": "Privacy",
  "footer.contact": "Contact",
  "footer.team": "Team access",

  "app.nav.agent": "Agent",
  "app.nav.models": "Models",
  "app.nav.history": "History",
  "app.nav.dev": "Developer",
  "app.nav.account": "Account",
  "app.header.balance": "Balance",
  "app.header.help": "Replay welcome",
  "app.header.internal": "Internal preview",

  "app.agent.hello": "Tell me what to create.",
  "app.agent.hello_sub":
    "I pick the best model, you stay in control. Every generation is billed at the shown cost.",
  "app.agent.starters_title": "To get you started",
  "app.agent.decision_lead": "Picked for you",
  "app.agent.decision_alt": "Alternatives",
  "app.agent.refine": "Refine",
  "app.agent.regenerate": "Regenerate",
  "app.agent.download": "Download",
  "app.agent.result_ready": "Result ready",

  "app.onb.step1.title": "An agent that picks the right model.",
  "app.onb.step1.body":
    "Say what you want — image, video, voice, text. Cortexia routes your prompt to the best model in the catalog and tells you why.",
  "app.onb.step2.title": "A playground per model.",
  "app.onb.step2.body":
    "Need fine control? Head to the catalog and pick your model. Each has its own form and live pricing.",
  "app.onb.step3.title": "No subscription. No surprises.",
  "app.onb.step3.body":
    "The price shows before every generation. Top up what you want — Mobile Money, card, crypto, Alipay — leave whenever.",
  "app.onb.next": "Next",
  "app.onb.skip": "Skip",
  "app.onb.done": "Start creating",
  "app.onb.welcome_credit": "$5 of welcome credits added to your account.",
};

// Portuguese, Spanish, Indonesian — cover the core landing strings.
// Missing keys fall back to English then French.
const pt: Dict = {
  "nav.open_app": "Abrir o app",
  "badge.launch": "Abertura — 1º de agosto",
  "badge.live": "No ar — acesso livre",
  "badge.prelaunch": "Pré-lançamento",
  "hero.title.a": "IA sem assinar",
  "hero.title.b": "aquilo que você nunca usa.",
  "hero.subtitle":
    "Um ponto de entrada para os melhores modelos — Kling, Seedance, Nano Banana, GPT-5, Claude, ElevenLabs — cobrado por geração. Pague com Mobile Money, cartão, cripto ou Alipay. Onde quer que você crie.",
  "waitlist.title": "Entrar na waitlist",
  "waitlist.email_placeholder": "voce@email.com",
  "waitlist.cta": "Reservar meu lugar",
  "waitlist.i_create": "Eu crio principalmente:",
  "waitlist.no_spam":
    "Sem spam. Um e-mail quando abrirmos, outro para te dar seus primeiros créditos.",
  "sim.title.a": "Digite seu uso. Veja o preço.",
  "sim.title.b": "Não o contrário.",
  "sim.your_month": "Seu mês com Cortexia",
  "sim.classic": "Com uma assinatura clássica",
  "sim.you_save": "Você economiza",
  "sim.this_month": "este mês.",
  "sim.threshold_note":
    "Neste volume, uma assinatura clássica começa a ser competitiva — mas você ainda só paga pelo que usa, sem compromisso, sem risco de pagar por um mês vazio.",
  "wall.title": "O verdadeiro benchmark é o que sai.",
  "wall.load_more": "Ver mais criações",
  "app.onb.done": "Começar a criar",
};

const es: Dict = {
  "nav.open_app": "Abrir la app",
  "badge.launch": "Apertura — 1 de agosto",
  "badge.live": "En línea — acceso libre",
  "badge.prelaunch": "Pre-lanzamiento",
  "hero.title.a": "IA sin suscribirte",
  "hero.title.b": "a lo que nunca usas.",
  "hero.subtitle":
    "Un único acceso a los mejores modelos — Kling, Seedance, Nano Banana, GPT-5, Claude, ElevenLabs — facturado por generación. Paga con Mobile Money, tarjeta, cripto o Alipay. Donde quiera que crees.",
  "waitlist.cta": "Reservar mi lugar",
  "waitlist.i_create": "Creo sobre todo:",
  "sim.title.a": "Escribe tu uso. Ve el precio.",
  "sim.title.b": "No al revés.",
  "sim.your_month": "Tu mes con Cortexia",
  "sim.you_save": "Ahorras",
  "sim.this_month": "este mes.",
  "wall.title": "El verdadero benchmark es lo que sale.",
  "wall.load_more": "Ver más creaciones",
  "app.onb.done": "Empezar a crear",
};

const id: Dict = {
  "nav.open_app": "Buka app",
  "badge.launch": "Rilis — 1 Agustus",
  "badge.live": "Online — akses bebas",
  "badge.prelaunch": "Pra-rilis",
  "hero.title.a": "AI tanpa berlangganan",
  "hero.title.b": "hal yang tak kamu pakai.",
  "hero.subtitle":
    "Satu akses ke model-model terbaik — Kling, Seedance, Nano Banana, GPT-5, Claude, ElevenLabs — dibayar per generasi. Bayar dengan Mobile Money, kartu, kripto atau Alipay. Di mana pun kamu berkarya.",
  "waitlist.cta": "Simpan tempatku",
  "waitlist.i_create": "Aku terutama membuat:",
  "sim.title.a": "Ketik pemakaianmu. Lihat harganya.",
  "sim.title.b": "Bukan sebaliknya.",
  "sim.your_month": "Bulanmu dengan Cortexia",
  "sim.you_save": "Kamu hemat",
  "sim.this_month": "bulan ini.",
  "wall.title": "Tolok ukur sebenarnya adalah hasilnya.",
  "wall.load_more": "Lihat lebih banyak karya",
  "app.onb.done": "Mulai berkreasi",
};

const DICTS: Record<Lang, Dict> = { fr, en, pt, id, es };

type State = {
  lang: Lang;
  langOverridden: boolean;
  setLang: (l: Lang) => void;
  setFromCurrency: (l: Lang) => void;
};

export const useLocaleStore = create<State>()(
  persist(
    (set) => ({
      lang: "fr",
      langOverridden: false,
      setLang: (lang) => set({ lang, langOverridden: true }),
      setFromCurrency: (lang) => set((s) => (s.langOverridden ? s : { lang })),
    }),
    { name: "cortexia-locale" },
  ),
);

export function useLang() {
  return useLocaleStore((s) => s.lang);
}

export function useT() {
  const lang = useLang();
  return (key: string): string => {
    return DICTS[lang][key] ?? DICTS.en[key] ?? DICTS.fr[key] ?? key;
  };
}
