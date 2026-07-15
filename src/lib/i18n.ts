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
  "hero.title": "Le meilleur rapport qualité-prix de la création IA.",
  "hero.punch": "Point final.",
  "hero.subtitle":
    "Cortexia orchestre le meilleur modèle pour chaque prompt — image, vidéo, voix, musique — et te facture uniquement ce que tu génères. Moins cher qu'un abonnement, sans jamais en être un.",
  "hero.micro_cta": "Payable par carte, Mobile Money, crypto ou Alipay — partout dans le monde.",

  "stat.models": "modèles",
  "stat.currencies": "devises",
  "stat.no_sub": "sans abo",

  "waitlist.title": "Réserve ta place avant le 1er août",
  "waitlist.subtitle": "Les premiers inscrits reçoivent des crédits offerts au lancement et un accès prioritaire.",
  "waitlist.email_placeholder": "ton@email.com",
  "waitlist.cta": "Je réserve ma place",
  "waitlist.i_create": "Je crée surtout :",
  "waitlist.no_spam": "Aucune carte requise. Aucun engagement. Juste une notification le jour du lancement.",
  "waitlist.done": "Tu es dedans.",
  "waitlist.your_seat": "Ta place",
  "waitlist.referral": "Ton lien de parrainage",
  "waitlist.referral_copy": "Chaque ami inscrit via ton lien te fait gagner 3 places et des crédits bonus pour vous deux au lancement.",
  "waitlist.copy": "Copier",
  "waitlist.copied": "Copié",
  "waitlist.friends_invited": "amis invités",
  "waitlist.launch_email":
    "Bien joué. On te prévient dès l'ouverture, le 1er août — avec tes crédits offerts déjà sur ton compte.",

  "agent.eyebrow": "L'agent créatif",
  "agent.title.a": "Tu décris.",
  "agent.title.b": "L'agent orchestre.",
  "agent.body":
    "Pas besoin de savoir que Kling excelle sur le mouvement de caméra et que Seedream est plus précis en photoréaliste. Tu écris ce que tu veux, Cortexia choisit le bon modèle — ou route vers plusieurs en parallèle si ton projet le demande. Tu gardes toujours la main pour changer, comparer, affiner.",
  "agent.point.a": "Un prompt, le bon modèle — automatiquement",
  "agent.point.b": "Change de modèle en un clic si tu préfères choisir toi-même",
  "agent.point.c": "Un seul accès pour tout le catalogue : image, vidéo, voix, musique",

  "sim.eyebrow": "La facture est le simulateur",
  "sim.title.a": "Compose ton mois type.",
  "sim.title.b": "Compare en direct avec un abonnement classique.",
  "sim.subtitle": "Tu vois exactement ce que tu payes — jamais plus.",
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

  "access.eyebrow": "Accessibilité",
  "access.title": "Disponible partout. Payable partout.",
  "access.body": "Carte bancaire, Mobile Money, crypto ou Alipay. Cortexia est construit pour fonctionner où que tu sois — parce qu'un bon outil ne devrait jamais dépendre de ta banque.",

  "wall.eyebrow": "Le vrai bench, c'est ce qui sort.",
  "wall.title": "Chaque rendu ci-dessous vient d'un modèle réellement disponible sur Cortexia.",
  "wall.subtitle": "Pas de démo, pas de cherry-picking — c'est le catalogue.",
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
  "compare.title": "Higgsfield. Midjourney. ElevenLabs. Claude.",
  "compare.subtitle": "Un seul compte, un seul prix.",
  "compare.old.subtitle": "Abonnements empilés",
  "compare.old.title": "L'ancien modèle",
  "compare.old.row1": "4 abonnements séparés, 4 factures fixes",
  "compare.old.row2": "Tu payes même les mois creux",
  "compare.old.row3": "Tu choisis le modèle à l'aveugle",
  "compare.old.row4": "Accès limité selon ta banque ou ton pays",
  "compare.old.note": "Même si tu ne génères rien ce mois-ci.",
  "compare.new.subtitle": "À l'usage, sans forfait",
  "compare.new.title": "Cortexia",
  "compare.new.row1": "1 seul accès, facturé à l'usage",
  "compare.new.row2": "Tu payes exactement ce que tu génères",
  "compare.new.row3": "L'agent choisit pour toi — ou tu gardes la main",
  "compare.new.row4": "Carte, Mobile Money, crypto, Alipay",
  "compare.new.note": "Tu n'as rien à payer les jours creux.",
  "compare.total": "Total mensuel",

  "social.eyebrow": "Ils attendent déjà",
  "social.copy":
    "créateurs inscrits, de Lomé à Jakarta en passant par São Paulo et Paris. Le premier accès se fait par ordre d'inscription — le parrainage fait remonter.",

  "faq.eyebrow": "Ce qu'on nous demande",
  "faq.title": "Questions honnêtes.",
  "faq.q1": "Combien ça coûte vraiment ?",
  "faq.a1": "Tu payes uniquement ce que tu génères, au prix affiché sur chaque modèle — pas de palier caché, pas de minimum mensuel.",
  "faq.q2": "C'est quoi l'agent ?",
  "faq.a2": "Un assistant qui lit ton prompt et choisit automatiquement le modèle le plus adapté dans le catalogue. Tu peux toujours reprendre la main.",
  "faq.q3": "Je peux payer avec Mobile Money, crypto ou Alipay ?",
  "faq.a3": "Oui, en plus de la carte bancaire classique, partout où c'est disponible.",
  "faq.q4": "Pourquoi c'est moins cher qu'un abonnement ?",
  "faq.a4": "Parce que tu ne payes jamais pour une capacité que tu n'utilises pas. Le simulateur plus haut le montre avec de vrais chiffres.",
  "faq.q5": "Quels modèles au lancement ?",
  "faq.a5": "Toute la famille Kling 3, Seedance 2, Nano Banana 2, GPT-5, Claude Sonnet/Opus, Gemini 3, ElevenLabs V3, et une douzaine d'autres. Nouveaux modèles ajoutés dès leur sortie.",
  "faq.q6": "Vous avez une API ?",
  "faq.a6": "Oui, dès le lancement. Endpoints REST, clés self-service, même moteur de facturation à l'usage, sans minimum mensuel.",

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
  "hero.title": "The best value in AI creation.",
  "hero.punch": "Full stop.",
  "hero.subtitle":
    "Cortexia routes your prompt to the best model — image, video, voice, music — and only charges you for what you generate. Cheaper than a subscription, without ever being one.",
  "hero.micro_cta": "Pay with card, Mobile Money, crypto or Alipay — anywhere in the world.",

  "stat.models": "models",
  "stat.currencies": "currencies",
  "stat.no_sub": "no sub",

  "waitlist.title": "Save your spot before August 1st",
  "waitlist.subtitle": "Early signups get welcome credits at launch and priority access.",
  "waitlist.email_placeholder": "you@email.com",
  "waitlist.cta": "Save my spot",
  "waitlist.i_create": "I mostly create:",
  "waitlist.no_spam": "No card required. No commitment. Just a notification on launch day.",
  "waitlist.done": "You're in.",
  "waitlist.your_seat": "Your spot",
  "waitlist.referral": "Your referral link",
  "waitlist.referral_copy": "Every friend who signs up through your link earns you 3 spots and bonus credits for both of you at launch.",
  "waitlist.copy": "Copy",
  "waitlist.copied": "Copied",
  "waitlist.friends_invited": "friends invited",
  "waitlist.launch_email":
    "Nice one. We'll email you on August 1st with your access — and your welcome credits already on your account.",

  "agent.eyebrow": "The creative agent",
  "agent.title.a": "You describe.",
  "agent.title.b": "The agent orchestrates.",
  "agent.body":
    "No need to know that Kling excels at camera movement and Seedream is sharper at photorealism. You write what you want, Cortexia picks the right model — or routes to several in parallel if your project demands it. You always keep control to switch, compare, refine.",
  "agent.point.a": "One prompt, the right model — automatically",
  "agent.point.b": "Switch models in one click if you prefer to choose",
  "agent.point.c": "One account for the whole catalog: image, video, voice, music",

  "sim.eyebrow": "The bill is the simulator",
  "sim.title.a": "Build your typical month.",
  "sim.title.b": "Compare side-by-side with a classic subscription.",
  "sim.subtitle": "You see exactly what you'd pay — nothing more.",
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

  "access.eyebrow": "Accessibility",
  "access.title": "Available everywhere. Payable everywhere.",
  "access.body": "Credit card, Mobile Money, crypto or Alipay. Cortexia is built to work wherever you are — because a good tool should never depend on your bank.",

  "wall.eyebrow": "The real benchmark is what comes out.",
  "wall.title": "Every render below comes from a model actually available on Cortexia.",
  "wall.subtitle": "No demo, no cherry-picking — this is the catalog.",
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
  "compare.title": "Higgsfield. Midjourney. ElevenLabs. Claude.",
  "compare.subtitle": "One account, one bill.",
  "compare.old.subtitle": "Stacked subscriptions",
  "compare.old.title": "The old way",
  "compare.old.row1": "4 separate subscriptions, 4 fixed bills",
  "compare.old.row2": "You pay even on quiet months",
  "compare.old.row3": "You pick the model blind",
  "compare.old.row4": "Access limited by your bank or country",
  "compare.old.note": "Even on months you don't generate anything.",
  "compare.new.subtitle": "Pay-as-you-go, no plan",
  "compare.new.title": "Cortexia",
  "compare.new.row1": "1 account, billed per use",
  "compare.new.row2": "You pay exactly what you generate",
  "compare.new.row3": "The agent chooses — or you stay in control",
  "compare.new.row4": "Card, Mobile Money, crypto, Alipay",
  "compare.new.note": "Nothing to pay on quiet days.",
  "compare.total": "Monthly total",

  "social.eyebrow": "They're already waiting",
  "social.copy":
    "creators signed up, from Lomé to Jakarta via São Paulo and Paris. First access is by signup order — referrals move you up.",

  "faq.eyebrow": "What you keep asking",
  "faq.title": "Straight answers.",
  "faq.q1": "How much does it actually cost?",
  "faq.a1": "You only pay for what you generate, at the price shown on each model — no hidden tiers, no monthly minimum.",
  "faq.q2": "What's the agent?",
  "faq.a2": "An assistant that reads your prompt and automatically picks the best model from the catalog. You can always take back control.",
  "faq.q3": "Can I pay with Mobile Money, crypto or Alipay?",
  "faq.a3": "Yes, alongside standard credit card, wherever it's available.",
  "faq.q4": "Why is it cheaper than a subscription?",
  "faq.a4": "Because you never pay for capacity you don't use. The simulator above shows it with real numbers.",
  "faq.q5": "What models at launch?",
  "faq.a5": "The full Kling 3 family, Seedance 2, Nano Banana 2, GPT-5, Claude Sonnet/Opus, Gemini 3, ElevenLabs V3, and a dozen more. New models added as they're released.",
  "faq.q6": "Do you have an API?",
  "faq.a6": "Yes, from day one. REST endpoints, self-service keys, same pay-as-you-go pricing, no monthly minimum.",

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
