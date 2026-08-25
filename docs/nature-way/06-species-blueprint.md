# Cortexia — Species / Design Blueprint

**Date :** 25 août 2026  
**Statut :** `inherited_and_locked_for_first_ring`  
**Référence visuelle :** interface existante du dépôt, notamment playground, compte, catalogue et canvas

## Direction retenue

Cortexia conserve une direction **dark-first, éditoriale et instrumentale**. Elle combine une typographie d’affichage serif pour les titres, une sans-serif nette pour l’interface et une monospace pour les prix, statuts, identifiants et données opérationnelles. L’interface doit évoquer un studio de création et non un tableau de bord financier : la dépense est visible, mais elle reste au service du résultat.

Aucune nouvelle palette concurrente n’est introduite dans le premier ring. La palette source utilise des surfaces sombres chaudes, un accent ambre pour l’action et le prix, un vert émeraude pour les états réussis, et un rouge réservé aux états destructifs. Le mode clair existant reste supporté, mais le canvas conserve une surface sombre pour la lisibilité des graphes.

## DNA visuel

| Élément          | Règle héritée                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Typographie      | Fraunces pour les titres ; Geist pour les contrôles ; JetBrains Mono pour prix, métriques et états |
| Couleur d’action | Ambre ; le même accent signale une action primaire et un coût estimé                               |
| Surface          | Plans superposés `surface-0` à `surface-3`, bordures fines et gradients discrets                   |
| Formes           | Rayons moyens à larges, cartes respirantes, pas de bordures lourdes                                |
| Iconographie     | Icônes simples, fonctionnelles, avec nom accessible et texte pour les actions critiques            |
| Mouvement        | Transitions courtes et shimmer uniquement pour l’attente ; respecter `prefers-reduced-motion`      |
| Densité          | Catalogue dense mais playground et checkout focalisés sur une action principale                    |
| Ton rédactionnel | Clair, court, bilingue si nécessaire, sans promesse de qualité ou d’économie non prouvée           |

## Hiérarchie des surfaces

La navigation principale sépare **Créer**, **Modèles**, **Historique**, **Compte** et **Développeurs**. Le catalogue sert à choisir ; le playground sert à produire ; l’historique sert à retrouver ; le compte sert à comprendre le solde, recharger et réconcilier ; le canvas sert à composer après que le tronc unitaire est fiable.

Sur le playground, le prix courant, l’unité et le modèle sont toujours visibles avant l’action. Après soumission, la surface montre un état de chargement, un coût réservé, puis un résultat ou une erreur récupérable. Sur le compte, les moyens de paiement sont présentés comme des chemins distincts mais partagent le même ledger.

## États obligatoires

| Surface          | États à concevoir et tester                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Catalogue        | chargement, vide, recherche sans résultat, modèle indisponible, prix non configuré                                                 |
| Playground       | formulaire incomplet, upload en cours, coût visible, crédits insuffisants, soumission, polling, succès, échec, timeout, retry      |
| Paiement         | montant invalide, commande créée, redirection externe, attente callback, succès idempotent, refus, mismatch en revue, retry        |
| Historique       | résultat texte, image, vidéo, audio, asset CDN borné, asset indisponible, suppression/rafraîchissement                             |
| Canvas agentique | message vide, analyse, plan proposé, coût faible, confirmation requise, annulation, application, échec partiel, canvas synchronisé |

## Responsive et accessibilité

À largeur mobile, les actions critiques restent accessibles sans dépendre du hover, les cartes média passent en pile et le checkout montre d’abord le montant, le moyen de paiement et l’état courant. À largeur bureau, les panneaux latéraux peuvent rester ouverts mais ne doivent pas réduire la zone de résultat au point de rendre le prompt ou le statut illisible. Chaque champ a un label associé, chaque icône-action un nom accessible, et le focus doit suivre les dialogs de confirmation et de paiement.

Les états d’erreur ne doivent pas être uniquement codés par couleur. Les états asynchrones annoncent leur progression textuellement, les animations peuvent être réduites, les vidéos hors viewport ne préchargent pas inutilement leur contenu et les messages de coût distinguent toujours estimation, réserve et débit final.

## Maquette de référence du premier ring

La maquette est héritée des écrans existants et doit être vérifiée sur quatre vues :

| Vue        | Composition attendue                                                                    | Action principale               |
| ---------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| Catalogue  | Filtres catégorie, recherche, cartes avec modèle, fournisseur, prix, statut             | Ouvrir le playground            |
| Playground | En-tête modèle/prix, zone d’entrée, résultat ou état asynchrone, historique             | Générer                         |
| Compte     | Solde, recharge Mobile Money prioritaire, carte complémentaire, historique transactions | Recharger                       |
| Canvas     | Graphe central, panneau agent, confirmation de coût et journal d’opérations             | Proposer puis appliquer un plan |

## Règle d’extension

Une nouvelle branche ne peut pas inventer son propre langage visuel. Elle hérite des tokens et de la hiérarchie ci-dessus. Une nouvelle interaction significative — par exemple template Canva, batch de générations ou agent multi-étapes — exige une mini-maquette et une revue de ses états d’échec avant implémentation.

## Références

[1]: ../../src/styles.css "Cortexia visual tokens"
[2]: ../../src/routes/app.models.$slug.tsx "Cortexia playground surface"
[3]: ../../src/routes/app.account.tsx "Cortexia account surface"
[4]: ../../src/components/canvas/agent-panel.tsx "Cortexia agent panel"
