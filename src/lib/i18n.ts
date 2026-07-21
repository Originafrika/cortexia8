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
  "badge.launch": "Ouverture , 1er août",
  "badge.live": "En ligne , accès libre",
  "badge.prelaunch": "Pré-lancement",

  "hero.title": "Un accès. Tous les modèles. Un agent qui sait lequel choisir.",
  "hero.subtitle":
    "Cortexia te donne le catalogue complet , Kling, Seedream, Nano Banana, Claude, ElevenLabs et le reste , en accès direct, playground par playground. Besoin d'aller vite ? L'agent choisit et orchestre à ta place. Facturé à l'usage, jamais à l'abonnement.",
  "hero.micro_cta": "30+ modèles. Un seul compte. Payable par carte, Mobile Money, crypto ou Alipay.",

  "stat.models": "modèles",
  "stat.currencies": "devises",
  "stat.no_sub": "sans abo",

  "modes.eyebrow": "Deux façons de créer",
  "modes.title":
    "Toi aux commandes, ou l'agent aux commandes. Ton choix, à chaque génération.",
  "modes.agent.title": "Mode Agent",
  "modes.agent.body":
    "Décris ce que tu veux. L'agent lit ton prompt, choisit le modèle le plus adapté dans tout le catalogue, et génère. Tu vois pourquoi il a choisi ce modèle, et tu peux en changer en un clic si tu préfères autre chose.",
  "modes.playground.title": "Mode Playground",
  "modes.playground.body":
    "Tu sais déjà que tu veux Kling 3.0 Pro pour ce mouvement de caméra, ou Seedream pour ce rendu photoréaliste ? Va directement sur son playground. Chaque modèle a son interface complète , résolution, ratio, durée, seed, style, tous les paramètres réels, rien de simplifié à l'excès.",
  "modes.synthesis":
    "Les deux modes partagent le même compte, le même solde, le même prix à l'usage. Tu changes de mode selon le projet, jamais selon ton fournisseur.",

  "catalog.eyebrow": "Catalogue",
  "catalog.title": "Pas un modèle. Le catalogue entier.",
  "catalog.body":
    "Image, vidéo, voix, musique, texte , plus de 30 modèles des meilleurs labos (Google, Anthropic, OpenAI, ByteDance, Kuaishou, ElevenLabs, xAI...) accessibles avec le même compte, le même solde, la même simplicité. Plus besoin de 4 abonnements pour 4 types de contenu.",

  "waitlist.title": "Réserve ta place avant le 1er août",
  "waitlist.subtitle":
    "Accès complet au catalogue et à l'agent dès l'ouverture. Les premiers inscrits reçoivent des crédits offerts et un accès prioritaire.",
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
    "Bien joué. On te prévient dès l'ouverture, le 1er août , avec tes crédits offerts déjà sur ton compte, accès direct au catalogue complet et à l'agent, dès le premier jour.",

  "sim.eyebrow": "La facture est le simulateur",
  "sim.title": "La facture est le simulateur. Pas de surprise.",
  "sim.subtitle":
    "Compose ton mois type, tous modèles confondus , un peu d'image, un peu de vidéo, un peu de voix. Compare en direct avec un abonnement classique.",
  "sim.eyebrow_card": "Simulateur",
  "sim.compose": "Compose ton mois type.",
  "sim.your_month": "Ton mois avec Cortexia",
  "sim.charged": "Facturé à la génération. Pas de mensualité fixe.",
  "sim.classic": "Avec un abonnement classique",
  "sim.you_save": "Tu économises",
  "sim.this_month": "ce mois-ci.",
  "sim.threshold_note":
    "À ce volume, un abonnement classique commence à être compétitif , mais tu ne payes toujours que ce que tu utilises, sans engagement, sans risque de payer pour rien un mois plus creux.",
  "sim.close_note":
    "Tu approches du seuil où un abonnement fixe redevient intéressant. Reste en usage tant que ton volume varie.",
  "sim.threshold_marker": "seuil abonnement",

  "compare.eyebrow": "Le vrai calcul",
  "compare.title": "Higgsfield. Midjourney. ElevenLabs. Claude. Un seul compte, un seul prix, tout le catalogue.",
  "compare.subtitle": "L'ancien modèle vs Cortexia.",
  "compare.old.subtitle": "L'ancien modèle",
  "compare.old.title": "Abonnements empilés",
  "compare.old.row1": "4 abonnements séparés, 4 factures fixes",
  "compare.old.row2": "Tu payes même les mois creux",
  "compare.old.row3": "Chaque outil impose son propre modèle",
  "compare.old.row4": "Accès limité selon ta banque ou ton pays",
  "compare.old.note": "Même si tu ne génères rien ce mois-ci.",
  "compare.new.subtitle": "À l'usage, sans forfait",
  "compare.new.title": "Cortexia",
  "compare.new.row1": "1 seul accès, tout le catalogue, une seule facture",
  "compare.new.row2": "Tu payes exactement ce que tu génères",
  "compare.new.row3": "Tu choisis le modèle exact , ou tu laisses l'agent choisir",
  "compare.new.row4": "Carte, Mobile Money, crypto, Alipay",
  "compare.new.note": "Tu n'as rien à payer les jours creux.",
  "compare.total": "Total mensuel",

  "wall.eyebrow": "Le vrai bench, c'est ce qui sort.",
  "wall.title": "Le vrai bench, c'est ce qui sort.",
  "wall.subtitle":
    "Chaque rendu ci-dessous vient d'un modèle du catalogue, généré au prix affiché. Filtre par type, ouvre pour voir le prompt et le modèle utilisé , pas de démo isolée, c'est ce que tu auras entre les mains.",
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

  "access.eyebrow": "Accessibilité",
  "access.title": "Disponible partout. Payable partout.",
  "access.body":
    "Carte bancaire, Mobile Money, crypto ou Alipay. Le catalogue complet, où que tu sois , parce qu'un bon outil ne devrait jamais dépendre de ta banque.",

  "social.eyebrow": "Ils attendent déjà",
  "social.copy":
    "créateurs inscrits, de Lomé à Jakarta en passant par São Paulo et Paris. Le premier accès se fait par ordre d'inscription , le parrainage fait remonter.",

  "faq.eyebrow": "Ce qu'on nous demande",
  "faq.title": "Questions honnêtes.",
  "faq.q1": "Je peux choisir moi-même le modèle, ou c'est toujours l'agent qui décide ?",
  "faq.a1": "Les deux. Chaque modèle a son propre playground accessible directement , tu peux aussi laisser l'agent choisir et orchestrer pour toi.",
  "faq.q2": "Combien de modèles seront disponibles au lancement ?",
  "faq.a2": "Plus de 30, couvrant image, vidéo, voix, musique et texte , le catalogue complet visible plus haut sur cette page.",
  "faq.q3": "Combien ça coûte vraiment ?",
  "faq.a3": "Tu payes uniquement ce que tu génères, au prix affiché sur chaque modèle , pas de palier caché, pas de minimum mensuel.",
  "faq.q4": "Je peux payer avec Mobile Money, crypto ou Alipay ?",
  "faq.a4": "Oui, en plus de la carte bancaire classique, partout où c'est disponible.",
  "faq.q5": "Pourquoi c'est moins cher qu'un abonnement ?",
  "faq.a5": "Parce que tu ne payes jamais pour une capacité que tu n'utilises pas. Le simulateur plus haut le montre avec de vrais chiffres.",
  "faq.q6": "Vous avez une API ?",
  "faq.a6": "Oui, dès le lancement. Endpoints REST, clés self-service, même moteur de facturation à l'usage, sans minimum mensuel.",

  "footer.copy": "© 2026. Construit pour les créateurs, partout.",
  "footer.policy": "Politique",
  "footer.contact": "Contact",
  "footer.team": "Accès équipe",

  // App
  "app.nav.agent": "Agent",
  "app.nav.models": "Modèles",
  "app.nav.canvas": "Canvas",
  "app.nav.workflows": "Workflows",
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
    "Dis ce que tu veux , image, vidéo, voix, texte. Cortexia route ton prompt vers le meilleur modèle du catalogue et t'explique pourquoi.",
  "app.onb.step2.title": "Un playground par modèle.",
  "app.onb.step2.body":
    "Besoin de contrôle fin ? Va directement dans le catalogue et choisis ton modèle. Chaque page a son formulaire dédié et son prix live.",
  "app.onb.step3.title": "Zéro abonnement. Zéro surprise.",
  "app.onb.step3.body":
    "Le prix s'affiche avant chaque génération. Tu recharges ce que tu veux , Mobile Money, carte, crypto, Alipay , et tu repars quand tu veux.",
  "app.onb.next": "Suivant",
  "app.onb.skip": "Passer",
  "app.onb.done": "Commencer à créer",
  "app.onb.welcome_credit": "5 $ de crédits offerts déposés sur ton compte.",
};

const en: Dict = {
  "nav.open_app": "Open app",
  "badge.launch": "Launching , August 1st",
  "badge.live": "Live , open access",
  "badge.prelaunch": "Pre-launch",

  "hero.title": "One access. Every model. An agent that knows which to pick.",
  "hero.subtitle":
    "Cortexia gives you the full catalog , Kling, Seedream, Nano Banana, Claude, ElevenLabs and more , direct access, playground by playground. Need it fast? The agent picks and orchestrates for you. Pay-as-you-go, never a subscription.",
  "hero.micro_cta": "30+ models. One account. Pay by card, Mobile Money, crypto or Alipay.",

  "stat.models": "models",
  "stat.currencies": "currencies",
  "stat.no_sub": "no sub",

  "modes.eyebrow": "Two ways to create",
  "modes.title":
    "You in control, or the agent in control. Your choice, every generation.",
  "modes.agent.title": "Agent mode",
  "modes.agent.body":
    "Describe what you want. The agent reads your prompt, picks the best model in the entire catalog, and generates. You see why it chose that model, and you can switch in one click if you'd rather pick yourself.",
  "modes.playground.title": "Playground mode",
  "modes.playground.body":
    "You already know you want Kling 3.0 Pro for that camera movement, or Seedream for photorealism? Go straight to its playground. Every model has its full interface , resolution, ratio, duration, seed, style, all the real parameters, nothing oversimplified.",
  "modes.synthesis":
    "Both modes share the same account, the same balance, the same pay-as-you-go pricing. You switch modes by project, never by provider.",

  "catalog.eyebrow": "Catalog",
  "catalog.title": "Not one model. The full catalog.",
  "catalog.body":
    "Image, video, voice, music, text , over 30 models from the best labs (Google, Anthropic, OpenAI, ByteDance, Kuaishou, ElevenLabs, xAI...) accessible with the same account, the same balance, the same simplicity. No more 4 subscriptions for 4 types of content.",

  "waitlist.title": "Save your spot before August 1st",
  "waitlist.subtitle":
    "Full catalog and agent access from day one. Early signups get welcome credits and priority access.",
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
    "Nice one. We'll email you on August 1st with your access , welcome credits already on your account, full catalog and agent access from day one.",

  "sim.eyebrow": "The bill is the simulator",
  "sim.title": "The bill is the simulator. No surprises.",
  "sim.subtitle":
    "Build your typical month, all models mixed , a bit of image, a bit of video, a bit of voice. Compare side-by-side with a classic subscription.",
  "sim.eyebrow_card": "Simulator",
  "sim.compose": "Compose your typical month.",
  "sim.your_month": "Your month with Cortexia",
  "sim.charged": "Charged per generation. No fixed monthly fee.",
  "sim.classic": "With a classic subscription",
  "sim.you_save": "You save",
  "sim.this_month": "this month.",
  "sim.threshold_note":
    "At this volume, a classic subscription starts to be competitive , but you still only pay what you use, with no commitment and no risk of paying for a quiet month.",
  "sim.close_note":
    "You're approaching the point where a flat subscription becomes worth it. Stay pay-as-you-go while your volume varies.",
  "sim.threshold_marker": "subscription break-even",

  "compare.eyebrow": "The real math",
  "compare.title": "Higgsfield. Midjourney. ElevenLabs. Claude. One account, one price, the full catalog.",
  "compare.subtitle": "The old model vs Cortexia.",
  "compare.old.subtitle": "The old model",
  "compare.old.title": "Stacked subscriptions",
  "compare.old.row1": "4 separate subscriptions, 4 fixed bills",
  "compare.old.row2": "You pay even on quiet months",
  "compare.old.row3": "Each tool forces its own model",
  "compare.old.row4": "Access limited by your bank or country",
  "compare.old.note": "Even on months you don't generate anything.",
  "compare.new.subtitle": "Pay-as-you-go, no plan",
  "compare.new.title": "Cortexia",
  "compare.new.row1": "1 account, the full catalog, one bill",
  "compare.new.row2": "You pay exactly what you generate",
  "compare.new.row3": "Pick the exact model , or let the agent choose",
  "compare.new.row4": "Card, Mobile Money, crypto, Alipay",
  "compare.new.note": "Nothing to pay on quiet days.",
  "compare.total": "Monthly total",

  "wall.eyebrow": "The real benchmark is what comes out.",
  "wall.title": "The real benchmark is what comes out.",
  "wall.subtitle":
    "Every render below comes from a catalog model, generated at the shown price. Filter by type, click to see the prompt and model used , no isolated demo, this is what you'll have in your hands.",
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

  "access.eyebrow": "Accessibility",
  "access.title": "Available everywhere. Payable everywhere.",
  "access.body":
    "Credit card, Mobile Money, crypto or Alipay. The full catalog, wherever you are , because a good tool should never depend on your bank.",

  "social.eyebrow": "They're already waiting",
  "social.copy":
    "creators signed up, from Lomé to Jakarta via São Paulo and Paris. First access is by signup order , referrals move you up.",

  "faq.eyebrow": "What you keep asking",
  "faq.title": "Straight answers.",
  "faq.q1": "Can I choose the model myself, or does the agent always decide?",
  "faq.a1": "Both. Every model has its own playground accessible directly , you can also let the agent pick and orchestrate for you.",
  "faq.q2": "How many models at launch?",
  "faq.a2": "Over 30, covering image, video, voice, music and text , the full catalog visible higher up on this page.",
  "faq.q3": "How much does it actually cost?",
  "faq.a3": "You only pay for what you generate, at the price shown on each model , no hidden tiers, no monthly minimum.",
  "faq.q4": "Can I pay with Mobile Money, crypto or Alipay?",
  "faq.a4": "Yes, alongside standard credit card, wherever it's available.",
  "faq.q5": "Why is it cheaper than a subscription?",
  "faq.a5": "Because you never pay for capacity you don't use. The simulator above shows it with real numbers.",
  "faq.q6": "Do you have an API?",
  "faq.a6": "Yes, from day one. REST endpoints, self-service keys, same pay-as-you-go pricing, no monthly minimum.",

  "footer.copy": "© 2026. Built for creators, everywhere.",
  "footer.policy": "Privacy",
  "footer.contact": "Contact",
  "footer.team": "Team access",

  "app.nav.agent": "Agent",
  "app.nav.models": "Models",
  "app.nav.canvas": "Canvas",
  "app.nav.workflows": "Workflows",
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
    "Say what you want , image, video, voice, text. Cortexia routes your prompt to the best model in the catalog and tells you why.",
  "app.onb.step2.title": "A playground per model.",
  "app.onb.step2.body":
    "Need fine control? Head to the catalog and pick your model. Each has its own form and live pricing.",
  "app.onb.step3.title": "No subscription. No surprises.",
  "app.onb.step3.body":
    "The price shows before every generation. Top up what you want , Mobile Money, card, crypto, Alipay , leave whenever.",
  "app.onb.next": "Next",
  "app.onb.skip": "Skip",
  "app.onb.done": "Start creating",
  "app.onb.welcome_credit": "$5 of welcome credits added to your account.",
};

// Portuguese, Spanish, Indonesian , cover the core landing strings.
// Missing keys fall back to English then French.
const pt: Dict = {
  "nav.open_app": "Abrir o app",
  "badge.launch": "Abertura, 1º de agosto",
  "badge.live": "No ar, acesso livre",
  "badge.prelaunch": "Pré-lançamento",
  "hero.title": "Um acesso. Todos os modelos. Um agente que sabe qual escolher.",
  "hero.subtitle":
    "Cortexia te dá o catálogo completo, Kling, Seedream, Nano Banana, Claude, ElevenLabs e mais, acesso direto, playground por playground. Precisa ir rápido? O agente escolhe e orquestra para você. Cobrado por uso, nunca por assinatura.",
  "hero.micro_cta": "30+ modelos. Uma conta. Pague com cartão, Mobile Money, cripto ou Alipay.",
  "modes.eyebrow": "Duas formas de criar",
  "modes.title": "Você no controle, ou o agente no controle. Sua escolha, a cada geração.",
  "modes.agent.title": "Modo Agente",
  "modes.agent.body":
    "Descreva o que você quer. O agente lê seu prompt, escolhe o melhor modelo no catálogo e gera. Você vê por que ele escolheu esse modelo e pode trocar em um clique.",
  "modes.playground.title": "Modo Playground",
  "modes.playground.body":
    "Você já sabe que quer Kling 3.0 Pro para esse movimento de câmera? Vá direto para o playground. Cada modelo tem sua interface completa: resolução, proporção, duração, seed, estilo, todos os parâmetros reais.",
  "modes.synthesis":
    "Os dois modos compartilham a mesma conta, o mesmo saldo, o mesmo preço por uso. Você troca de modo por projeto, nunca por provedor.",
  "catalog.eyebrow": "Catálogo",
  "catalog.title": "Não um modelo. O catálogo completo.",
  "catalog.body":
    "Imagem, vídeo, voz, música, texto, mais de 30 modelos dos melhores laboratórios acessíveis com a mesma conta, o mesmo saldo. Não precisa de 4 assinaturas para 4 tipos de conteúdo.",
  "waitlist.title": "Reserve seu lugar antes de 1º de agosto",
  "waitlist.subtitle":
    "Acesso completo ao catálogo e ao agente na abertura. Os primeiros inscritos recebem créditos e acesso prioritário.",
  "waitlist.email_placeholder": "seu@email.com",
  "waitlist.cta": "Reservar meu lugar",
  "waitlist.i_create": "Eu crio principalmente:",
  "waitlist.no_spam": "Sem cartão. Sem compromisso. Só uma notificação no dia do lançamento.",
  "waitlist.done": "Você está dentro.",
  "waitlist.referral": "Seu link de indicação",
  "waitlist.referral_copy": "Cada amigo que se inscrever pelo seu link ganha 3 lugares e créditos bônus para vocês dois no lançamento.",
  "waitlist.copy": "Copiar",
  "waitlist.copied": "Copiado",
  "waitlist.friends_invited": "amigos convidados",
  "waitlist.launch_email": "Pronto. avisamos na abertura, 1º de agosto, com seus créditos já na conta.",
  "sim.eyebrow": "A fatura é o simulador",
  "sim.title": "A fatura é o simulador. Sem surpresas.",
  "sim.subtitle": "Monte seu mês típico, todos os modelos misturados. Compare com uma assinatura clássica.",
  "sim.eyebrow_card": "Simulador",
  "sim.compose": "Monte seu mês típico.",
  "sim.your_month": "Seu mês com Cortexia",
  "sim.charged": "Cobrado por geração. Sem mensalidade fixa.",
  "sim.classic": "Com uma assinatura clássica",
  "sim.you_save": "Você economiza",
  "sim.this_month": "este mês.",
  "sim.threshold_note": "Neste volume, uma assinatura começa a ser competitiva, mas você só paga pelo que usa, sem compromisso.",
  "sim.close_note": "Você está perto do ponto onde uma assinatura compensa. Continue no pay-as-you-go enquanto seu volume varia.",
  "sim.threshold_marker": "ponto de equilíbrio",
  "compare.eyebrow": "O cálculo real",
  "compare.title": "Higgsfield. Midjourney. ElevenLabs. Claude. Uma conta, um preço, todo o catálogo.",
  "compare.subtitle": "O modelo antigo vs Cortexia.",
  "compare.old.subtitle": "O modelo antigo",
  "compare.old.title": "Assinaturas empilhadas",
  "compare.old.row1": "4 assinaturas separadas, 4 contas fixas",
  "compare.old.row2": "Você paga mesmo em meses vazios",
  "compare.old.row3": "Cada ferramenta impõe seu próprio modelo",
  "compare.old.row4": "Acesso limitado pelo seu banco ou país",
  "compare.old.note": "Mesmo que você não gere nada este mês.",
  "compare.new.subtitle": "Por uso, sem plano",
  "compare.new.title": "Cortexia",
  "compare.new.row1": "1 acesso, todo o catálogo, uma conta",
  "compare.new.row2": "Você paga exatamente o que gera",
  "compare.new.row3": "Escolha o modelo exato ou deixe o agente escolher",
  "compare.new.row4": "Cartão, Mobile Money, cripto, Alipay",
  "compare.new.note": "Nada para pagar em dias vazios.",
  "compare.total": "Total mensal",
  "wall.eyebrow": "O benchmark real é o que sai.",
  "wall.title": "O benchmark real é o que sai.",
  "wall.subtitle": "Cada render abaixo vem de um modelo do catálogo, gerado no preço exibido.",
  "wall.load_more": "Ver mais criações",
  "access.eyebrow": "Acessibilidade",
  "access.title": "Disponível em todo lugar. Pago em todo lugar.",
  "access.body": "Cartão, Mobile Money, cripto ou Alipay. O catálogo completo, onde quer que você esteja.",
  "social.eyebrow": "Já estão esperando",
  "social.copy": "criadores inscritos, de Lomé a Jacarta passando por São Paulo e Paris.",
  "faq.eyebrow": "O que perguntam",
  "faq.title": "Perguntas honestas.",
  "faq.q1": "Posso escolher o modelo ou o agente sempre decide?",
  "faq.a1": "Os dois. Cada modelo tem seu playground acessível diretamente, ou você pode deixar o agente escolher.",
  "faq.q2": "Quantos modelos terão no lançamento?",
  "faq.a2": "Mais de 30, cobrindo imagem, vídeo, voz, música e texto.",
  "faq.q3": "Quanto custa realmente?",
  "faq.a3": "Você paga só pelo que gera, no preço exibido em cada modelo. Sem camadas escondidas, sem mínimo mensal.",
  "faq.q4": "Posso pagar com Mobile Money, cripto ou Alipay?",
  "faq.a4": "Sim, além do cartão de crédito, onde estiver disponível.",
  "faq.q5": "Por que é mais barato que uma assinatura?",
  "faq.a5": "Porque você nunca paga por capacidade que não usa. O simulador mostra com números reais.",
  "faq.q6": "Vocês têm API?",
  "faq.a6": "Sim, desde o lançamento. Endpoints REST, chaves self-service, mesmo faturamento por uso, sem mínimo mensal.",
  "footer.copy": "© 2026. Construído para os criadores, em todo lugar.",
  "footer.policy": "Privacidade",
  "footer.contact": "Contato",
  "footer.team": "Acesso da equipe",
  "app.onb.done": "Começar a criar",
};

const es: Dict = {
  "nav.open_app": "Abrir la app",
  "badge.launch": "Apertura, 1 de agosto",
  "badge.live": "En línea, acceso libre",
  "badge.prelaunch": "Pre-lanzamiento",
  "hero.title": "Un acceso. Todos los modelos. Un agente que sabe cuál elegir.",
  "hero.subtitle":
    "Cortexia te da el catálogo completo, Kling, Seedream, Nano Banana, Claude, ElevenLabs y más, acceso directo, playground por playground. ¿Necesitas ir rápido? El agente elige y orquesta por ti. Facturado por uso, nunca por suscripción.",
  "hero.micro_cta": "30+ modelos. Una sola cuenta. Paga con tarjeta, Mobile Money, cripto o Alipay.",
  "modes.eyebrow": "Dos formas de crear",
  "modes.title": "Tú al mando, o el agente al mando. Tu elección, en cada generación.",
  "modes.agent.title": "Modo Agente",
  "modes.agent.body":
    "Describe lo que quieres. El agente lee tu prompt, elige el mejor modelo del catálogo y genera. Ves por qué eligió ese modelo y puedes cambiarlo en un clic.",
  "modes.playground.title": "Modo Playground",
  "modes.playground.body":
    "¿Ya sabes que quieres Kling 3.0 Pro para ese movimiento de cámara? Ve directo a su playground. Cada modelo tiene su interfaz completa: resolución, proporción, duración, seed, estilo, todos los parámetros reales.",
  "modes.synthesis":
    "Los dos modos comparten la misma cuenta, el mismo saldo, el mismo precio por uso. Cambias de modo por proyecto, nunca por proveedor.",
  "catalog.eyebrow": "Catálogo",
  "catalog.title": "No un modelo. El catálogo completo.",
  "catalog.body":
    "Imagen, video, voz, música, texto, más de 30 modelos de los mejores laboratorios accesibles con la misma cuenta, el mismo saldo. No necesitas 4 suscripciones para 4 tipos de contenido.",
  "waitlist.title": "Reserva tu lugar antes del 1 de agosto",
  "waitlist.subtitle":
    "Acceso completo al catálogo y al agente en la apertura. Los primeros inscritos reciben créditos y acceso prioritario.",
  "waitlist.email_placeholder": "tu@email.com",
  "waitlist.cta": "Reservar mi lugar",
  "waitlist.i_create": "Creo sobre todo:",
  "waitlist.no_spam": "Sin tarjeta. Sin compromiso. Solo una notificación el día del lanzamiento.",
  "waitlist.done": "Estás dentro.",
  "waitlist.referral": "Tu link de referido",
  "waitlist.referral_copy": "Cada amigo que se inscriba por tu link gana 3 lugares y créditos extra para ambos en el lanzamiento.",
  "waitlist.copy": "Copiar",
  "waitlist.copied": "Copiado",
  "waitlist.friends_invited": "amigos invitados",
  "waitlist.launch_email": "Listo. Te avisamos en la apertura, 1 de agosto, con tus créditos ya en tu cuenta.",
  "sim.eyebrow": "La factura es el simulador",
  "sim.title": "La factura es el simulador. Sin sorpresas.",
  "sim.subtitle": "Armá tu mes típico, todos los modelos mezclados. Compará con una suscripción clásica.",
  "sim.eyebrow_card": "Simulador",
  "sim.compose": "Armá tu mes típico.",
  "sim.your_month": "Tu mes con Cortexia",
  "sim.charged": "Facturado por generación. Sin cuota fija.",
  "sim.classic": "Con una suscripción clásica",
  "sim.you_save": "Ahorras",
  "sim.this_month": "este mes.",
  "sim.threshold_note": "A este volumen, una suscripción empieza a ser competitiva, pero solo pagas lo que usas, sin compromiso.",
  "sim.close_note": "Estás cerca del punto donde una suscripción compensa. Sigue pay-as-you-go mientras tu volumen varía.",
  "sim.threshold_marker": "punto de equilibrio",
  "compare.eyebrow": "El cálculo real",
  "compare.title": "Higgsfield. Midjourney. ElevenLabs. Claude. Una cuenta, un precio, todo el catálogo.",
  "compare.subtitle": "El modelo viejo vs Cortexia.",
  "compare.old.subtitle": "El modelo viejo",
  "compare.old.title": "Suscripciones apiladas",
  "compare.old.row1": "4 suscripciones separadas, 4 facturas fijas",
  "compare.old.row2": "Pagas incluso en meses vacíos",
  "compare.old.row3": "Cada herramienta impone su propio modelo",
  "compare.old.row4": "Acceso limitado por tu banco o país",
  "compare.old.note": "Incluso si no generás nada este mes.",
  "compare.new.subtitle": "Por uso, sin plan",
  "compare.new.title": "Cortexia",
  "compare.new.row1": "1 acceso, todo el catálogo, una factura",
  "compare.new.row2": "Pagás exactamente lo que generás",
  "compare.new.row3": "Elegís el modelo exacto o dejás que el agente elija",
  "compare.new.row4": "Tarjeta, Mobile Money, cripto, Alipay",
  "compare.new.note": "Nada que pagar en días vacíos.",
  "compare.total": "Total mensual",
  "wall.eyebrow": "El benchmark real es lo que sale.",
  "wall.title": "El benchmark real es lo que sale.",
  "wall.subtitle": "Cada render abajo viene de un modelo del catálogo, generado al precio mostrado.",
  "wall.load_more": "Ver más creaciones",
  "access.eyebrow": "Accesibilidad",
  "access.title": "Disponible en todos lados. Pagable en todos lados.",
  "access.body": "Tarjeta, Mobile Money, cripto o Alipay. El catálogo completo, donde quiera que estés.",
  "social.eyebrow": "Ya están esperando",
  "social.copy": "creadores inscritos, de Lomé a Yakarta pasando por São Paulo y París.",
  "faq.eyebrow": "Lo que preguntan",
  "faq.title": "Preguntas honestas.",
  "faq.q1": "¿Puedo elegir el modelo o el agente siempre decide?",
  "faq.a1": "Los dos. Cada modelo tiene su playground accesible directamente, o podés dejar que el agente elija.",
  "faq.q2": "¿Cuántos modelos habrá en el lanzamiento?",
  "faq.a2": "Más de 30, cubriendo imagen, video, voz, música y texto.",
  "faq.q3": "¿Cuánto cuesta realmente?",
  "faq.a3": "Pagás solo por lo que generás, al precio mostrado en cada modelo. Sin capas ocultas, sin mínimo mensal.",
  "faq.q4": "¿Puedo pagar con Mobile Money, cripto o Alipay?",
  "faq.a4": "Sí, además de tarjeta de crédito, donde esté disponible.",
  "faq.q5": "¿Por qué es más barato que una suscripción?",
  "faq.a5": "Porque nunca pagás por capacidad que no usás. El simulador lo muestra con números reales.",
  "faq.q6": "¿Tienen API?",
  "faq.a6": "Sí, desde el lanzamiento. Endpoints REST, claves self-service, mismo faturamiento por uso, sin mínimo mensal.",
  "footer.copy": "© 2026. Construido para los creadores, en todos lados.",
  "footer.policy": "Privacidad",
  "footer.contact": "Contacto",
  "footer.team": "Acceso del equipo",
  "app.onb.done": "Empezar a crear",
};

const id: Dict = {
  "nav.open_app": "Buka app",
  "badge.launch": "Rilis, 1 Agustus",
  "badge.live": "Online, akses bebas",
  "badge.prelaunch": "Pra-rilis",
  "hero.title": "Satu akses. Semua model. Agen yang tahu mana yang dipilih.",
  "hero.subtitle":
    "Cortexia memberikanmu katalog lengkap, Kling, Seedream, Nano Banana, Claude, ElevenLabs dan lainnya, akses langsung, playground per model. Butuh cepat? Agen memilih dan mengorkestrasi untukmu. Dibayar per penggunaan, bukan berlangganan.",
  "hero.micro_cta": "30+ model. Satu akun. Bayar pakai kartu, Mobile Money, kripto atau Alipay.",
  "modes.eyebrow": "Dua cara berkarya",
  "modes.title": "Kamu yang kendali, atau agen yang kendali. Pilihanmu, setiap generasi.",
  "modes.agent.title": "Mode Agen",
  "modes.agent.body":
    "Jelaskan yang kamu mau. Agen membaca promptmu, memilih model terbaik di seluruh katalog, dan menghasilkan. Kamu lihat kenapa model itu dipilih, dan bisa berganti dalam satu klik.",
  "modes.playground.title": "Mode Playground",
  "modes.playground.body":
    "Sudah tahu mau pakai Kling 3.0 Pro untuk pergerakan kamera itu? Langsung ke playground-nya. Setiap model punya antarmuka lengkap: resolusi, rasio, durasi, seed, gaya, semua parameter asli.",
  "modes.synthesis":
    "Kedua mode berbagi akun yang sama, saldo yang sama, harga yang sama per penggunaan. Kamu ganti mode per proyek, bukan per penyedia.",
  "catalog.eyebrow": "Katalog",
  "catalog.title": "Bukan satu model. Katalog lengkap.",
  "catalog.body":
    "Gambar, video, suara, musik, teks, lebih dari 30 model dari lab terbaik yang bisa diakses dengan akun yang sama, saldo yang sama. Tidak perlu 4 langganan untuk 4 jenis konten.",
  "waitlist.title": "Simpan tempatmu sebelum 1 Agustus",
  "waitlist.subtitle":
    "Akses lengkap ke katalog dan agen saat pembukaan. Pendaftar awal mendapat kredit dan akses prioritas.",
  "waitlist.email_placeholder": "kamu@email.com",
  "waitlist.cta": "Simpan tempatku",
  "waitlist.i_create": "Aku terutama membuat:",
  "waitlist.no_spam": "Tanpa kartu. Tanpa komitmen. Hanya notifikasi di hari peluncuran.",
  "waitlist.done": "Kamu sudah masuk.",
  "waitlist.referral": "Link referral-mu",
  "waitlist.referral_copy": "Setiap teman yang mendaftar lewat link-mu mendapat 3 tempat dan kredit bonus untuk kalian berdua saat peluncuran.",
  "waitlist.copy": "Salin",
  "waitlist.copied": "Tersalin",
  "waitlist.friends_invited": "teman diundang",
  "waitlist.launch_email": "Siap. Kami kabari saat pembukaan, 1 Agustus, dengan kreditmu sudah di akun.",
  "sim.eyebrow": "Tagihan adalah simulasi",
  "sim.title": "Tagihan adalah simulasi. Tanpa kejutan.",
  "sim.subtitle": "Rancang bulan tipemu, semua model dicampur. Bandingkan dengan langganan klasik.",
  "sim.eyebrow_card": "Simulator",
  "sim.compose": "Rancang bulan tipemu.",
  "sim.your_month": "Bulanmu dengan Cortexia",
  "sim.charged": "Dibayar per generasi. Tanpa biaya tetap.",
  "sim.classic": "Dengan langganan klasik",
  "sim.you_save": "Kamu hemat",
  "sim.this_month": "bulan ini.",
  "sim.threshold_note": "Di volume ini, langganan mulai kompetitif, tapi kamu tetap hanya bayar yang dipakai, tanpa komitmen.",
  "sim.close_note": "Kamu mendekati titik di mana langganan tetap lebih worth it. Tetap pay-as-you-go selagi volumemu bervariasi.",
  "sim.threshold_marker": "titik impas",
  "compare.eyebrow": "Perhitungan nyata",
  "compare.title": "Higgsfield. Midjourney. ElevenLabs. Claude. Satu akun, satu harga, seluruh katalog.",
  "compare.subtitle": "Model lama vs Cortexia.",
  "compare.old.subtitle": "Model lama",
  "compare.old.title": "Langganan bertumpuk",
  "compare.old.row1": "4 langganan terpisah, 4 tagihan tetap",
  "compare.old.row2": "Kamu bayar bahkan di bulan sepi",
  "compare.old.row3": "Setiap alat memaksakan modelnya sendiri",
  "compare.old.row4": "Akses terbatas oleh bank atau negaramu",
  "compare.old.note": "Meskipun kamu tidak menghasilkan apa pun bulan ini.",
  "compare.new.subtitle": "Per penggunaan, tanpa paket",
  "compare.new.title": "Cortexia",
  "compare.new.row1": "1 akses, seluruh katalog, satu tagihan",
  "compare.new.row2": "Kamu bayar tepat apa yang kamu hasilkan",
  "compare.new.row3": "Pilih model yang tepat atau biarkan agen memilih",
  "compare.new.row4": "Kartu, Mobile Money, kripto, Alipay",
  "compare.new.note": "Tidak ada yang harus dibayar di hari sepi.",
  "compare.total": "Total bulanan",
  "wall.eyebrow": "Benchmark nyata adalah yang dihasilkan.",
  "wall.title": "Benchmark nyata adalah yang dihasilkan.",
  "wall.subtitle": "Setiap render di bawah ini berasal dari model katalog, dihasilkan dengan harga yang ditampilkan.",
  "wall.load_more": "Lihat lebih banyak karya",
  "access.eyebrow": "Aksesibilitas",
  "access.title": "Tersedia di mana saja. Bisa dibayar di mana saja.",
  "access.body": "Kartu, Mobile Money, kripto atau Alipay. Katalog lengkap, di mana pun kamu berada.",
  "social.eyebrow": "Sudah menunggu",
  "social.copy": "kreator terdaftar, dari Lomé ke Jakarta melewati São Paulo dan Paris.",
  "faq.eyebrow": "Yang ditanyakan",
  "faq.title": "Pertanyaan jujur.",
  "faq.q1": "Bisakah aku memilih model sendiri, atau agen yang selalu memutuskan?",
  "faq.a1": "Keduanya. Setiap model punya playground yang bisa diakses langsung, atau kamu bisa biarkan agen memilih.",
  "faq.q2": "Berapa banyak model saat peluncuran?",
  "faq.a2": "Lebih dari 30, mencakup gambar, video, suara, musik dan teks.",
  "faq.q3": "Berapa biayanya sebenarnya?",
  "faq.a3": "Kamu hanya bayar apa yang kamu hasilkan, dengan harga yang ditampilkan di setiap model. Tanpa lapisan tersembunyi, tanpa minimum bulanan.",
  "faq.q4": "Bisakah saya bayar dengan Mobile Money, kripto atau Alipay?",
  "faq.a4": "Ya, selain kartu kredit, di mana pun tersedia.",
  "faq.q5": "Mengapa lebih murah dari langganan?",
  "faq.a5": "Karena kamu tidak pernah membayar untuk kapasitas yang tidak kamu pakai. Simulator menunjukkan dengan angka nyata.",
  "faq.q6": "Apakah ada API?",
  "faq.a6": "Ya, sejak peluncuran. Endpoints REST, kunci self-service, sistem tagihan yang sama per penggunaan, tanpa minimum bulanan.",
  "footer.copy": "© 2026. Dibuat untuk kreator, di mana saja.",
  "footer.policy": "Privasi",
  "footer.contact": "Kontak",
  "footer.team": "Akses tim",
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
