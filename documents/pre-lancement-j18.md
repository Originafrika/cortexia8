# Plan pré-lancement — J-18 (13 juil → 1er août)

## Constat
- Landing page live avec waitlist : 4 218 inscrits
- Pricing défini pour 30+ modèles
- Paiements : Mobile Money, carte, crypto, Alipay
- Code : TanStack Start / React / Lovable / repo privé originafrika/cortexia8

## Priorités J-18 → J-0

### Semaine 1 (13-19 juil) — Stabilisation
- [ ] Tests de paiement Mobile Money (Orange Money, MTN, Wave)
- [ ] Tests de paiement crypto (USDT/USDC)
- [ ] Vérification flux complet : inscription → recharge → génération
- [ ] Correction bugs UI (picsum.photos = placeholders à remplacer)

### Semaine 2 (20-26 juil) — Contenu
- [ ] Remplacer les placeholders picsum par des vrais rendus modèle
- [ ] Finaliser les pages modèle (app.models.$slug)
- [ ] Ajouter FAQ supplémentaire si nécessaire
- [ ] Préparer email de lancement pour les 4 218 waitlisters

### Semaine 3 (27 juil-1er août) — Lancement
- [ ] Test de charge (4k+ inscriptions)
- [ ] Email go-live à la waitlist
- [ ] Annonce réseaux sociaux
- [ ] Activation API (endpoints REST documentés)

## Risques
- Paiement Mobile Money : friction technique à valider (déjà échoué en 2025 sur Cortexia 1)
- 4 218 inscrits = attentes élevées au J-0
- Concurrents : Higgsfield, Google Flow Agent existent aujourd'hui
