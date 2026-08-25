# Cortexia — Notes de recherche marché

**Date d’observation :** 25 août 2026  
**Statut :** `draft_for_reconciliation`

Les pages publiques observées montrent que les plateformes concurrentes monétisent principalement par abonnements, crédits ou consommation à l’usage. Higgsfield expose une suite créative multi-surface — image, vidéo, audio, édition, studios marketing, canvas, MCP/CLI et pricing — ce qui confirme que la concurrence se déplace d’un simple générateur vers un **workspace créatif**. La page de prix était chargée dynamiquement ; aucune valeur tarifaire n’a été élevée au rang de donnée ferme à partir du seul rendu navigateur.[1]

ElevenLabs affiche une architecture d’offre par paliers avec une entrée gratuite, des crédits mensuels et des surfaces créatives regroupant texte-vers-voix, transcription, effets sonores, musique, image, vidéo et Studio. La page publique observée affichait notamment Free à 0 USD avec 10 000 crédits, Starter à 6 USD avec 30 000 crédits, Creator à 22 USD affiché avec une première période à 11 USD et 121 000 crédits, Pro à 99 USD avec 600 000 crédits, Scale à 299 USD avec 1,8 million de crédits et Business à 990 USD avec 6 millions de crédits. Les prix sont annoncés hors taxes, prélèvements et droits.[2]

Les plateformes d’infrastructure créative restent une référence pour la transparence à l’usage. Replicate indique que certains modèles sont facturés au temps matériel tandis que d’autres le sont à l’entrée/sortie, avec des exemples publics comme Flux 1.1 Pro à 0,04 USD par image, Flux Dev à 0,025 USD par image et Wan 2.1 I2V 720p à 0,25 USD par seconde de vidéo.[3] La page fal.ai observée décrit une facturation par sortie pour plusieurs modèles, avec des exemples normalisés tels que Wan 2.5 à 0,05 USD par seconde, Kling 2.5 Turbo Pro à 0,07 USD par seconde, Seedream V4 à 0,03 USD par image, Nanobanana à 0,0398 USD par image et Qwen à 0,02 USD par mégapixel.[4] Ces chiffres sont des références datées de pages publiques, pas une promesse de prix Cortexia.

FedaPay documente une couverture de paiement utile au premier marché cible : Bénin, Côte d’Ivoire, Niger, Sénégal, Togo, Mali, Burkina Faso et Guinée apparaissent avec différents moyens Mobile Money ; la page distingue aussi les cartes Visa/Mastercard et précise que les liens ou tokens de paiement sont à usage limité dans le temps. La page commerciale FedaPay met en avant cinq pays — Bénin, Côte d’Ivoire, Togo, Sénégal et Niger — et des paiements Mobile Money et cartes en XOF.[5] [6] La couverture exacte, l’onboarding marchand, les frais, les délais de reversement et les conditions de conformité doivent être confirmés pour le pays de lancement avant toute promesse commerciale.

## Conséquence de positionnement

Cortexia ne doit pas essayer de gagner uniquement par un pourcentage de remise sur chaque modèle, car les fournisseurs modifient leurs tarifs et leurs unités de facturation. La proposition défendable est un **compte unifié en XOF et USD de référence**, un prix final lisible avant exécution, une marge explicitement contrôlée, le paiement Mobile Money, puis carte, et des workflows qui réduisent le coût cognitif du changement d’outil. Le prix “meilleur” doit être défini par modèle, unité, pays, frais de paiement, coût de stockage, taux d’échec et marge cible — pas par une réduction générale non soutenable.

## Hypothèse économique à tester

Pour le premier ring, utiliser un portefeuille prépayé plutôt qu’un abonnement obligatoire. Afficher le coût estimé avant génération, appliquer une réserve serveur, rembourser automatiquement les échecs de soumission fournisseur et conserver une marge par exécution. Tester ensuite trois packages simples — découverte, créateur, équipe — sans verrouiller la vision sur des montants avant d’avoir mesuré le panier, le taux d’échec Mobile Money et le coût réel des assets.

## Références

[1]: https://higgsfield.ai/pricing "Higgsfield pricing page"
[2]: https://elevenlabs.io/pricing "ElevenLabs public pricing"
[3]: https://replicate.com/pricing "Replicate pricing"
[4]: https://fal.ai/pricing "fal model API pricing"
[5]: https://docs-v1.fedapay.com/payments/payment-methods "FedaPay supported payment methods"
[6]: https://www.fedapay.com/ "FedaPay payment coverage and products"
