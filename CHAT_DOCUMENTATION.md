# Chat AQI Amélioré

## Fonctionnalités

### 🎨 Design Moderne
- **Glassmorphism** : Arrière-plan flou avec transparence
- **Gradients** : Boutons et headers avec des dégradés attrayants  
- **Animations fluides** : Transitions avec Framer Motion
- **Badge AQI animé** : Indicateur de qualité d'air avec pulsation
- **Interface responsive** : S'adapte aux différentes tailles d'écran

### 💬 Fonctionnalités de Chat
- **Messages en temps réel** avec timestamps
- **États de chargement** avec indicateurs visuels
- **Auto-scroll** vers les nouveaux messages
- **Focus automatique** sur l'input quand le chat s'ouvre
- **Support clavier** (Entrée pour envoyer)

### 🤖 Intelligence AI
- **Intégration Gemini AI** pour répondre aux questions sur l'AQI
- **Contexte intelligent** : L'AI connaît les données actuelles d'AQI
- **Conseils personnalisés** basés sur les conditions locales
- **Réponses en français** avec conseils de santé spécifiques

### 📊 Métadonnées AQI
- **Données en temps réel** : AQI, PM2.5, PM10, température, humidité
- **Localisation** : Affichage de la région actuelle
- **Couleurs dynamiques** : Badge coloré selon le niveau AQI
- **Mise à jour automatique** : Rafraîchissement périodique des données

## Installation

### 1. Dépendances
```bash
npm install framer-motion @google/generative-ai lucide-react
```

### 2. Configuration API Gemini
1. Obtenez votre clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copiez `.env.example` vers `.env.local`
3. Ajoutez votre clé API :
```env
NEXT_PUBLIC_GEMINI_API_KEY=votre_cle_api_gemini
```

### 3. Utilisation
```tsx
import AQIChat from '@/components/AQIChat'

export default function Page() {
  return (
    <div>
      {/* Votre contenu */}
      <AQIChat />
    </div>
  )
}
```

## Personnalisation

### Couleurs et Thème
- Les couleurs s'adaptent automatiquement au thème sombre/clair
- Les gradients utilisent les couleurs Tailwind CSS
- Le badge AQI utilise les couleurs définies dans `lib/types.ts`

### Métadonnées
Utilisez le hook `useAQIMetadata` pour mettre à jour les données :
```tsx
import { useAQIMetadata } from '@/hooks/useAQIMetadata'

const { metadata, updateMetadata } = useAQIMetadata()

// Mise à jour des données
updateMetadata({
  aqi: 45,
  name: "Nouvelle Ville",
  pm25: 20
})
```

### Messages Personnalisés
Modifiez le message d'accueil dans le composant :
```tsx
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    content: "Votre message d'accueil personnalisé",
    isUser: false,
    timestamp: new Date()
  }
])
```

## Animations

### Framer Motion
- **Bouton toggle** : Scale au hover/tap
- **Panel chat** : Spring animation à l'ouverture
- **Messages** : Fade-in avec translation Y
- **Badge AQI** : Pulsation répétitive
- **Icônes** : Rotation fluide lors du toggle

### Transitions
- **Backdrop blur** : Effet de flou sur l'arrière-plan
- **Ease-out** : Courbe d'animation naturelle
- **Durées optimisées** : 200-300ms pour la fluidité

## Structure des Types

### Message
```tsx
interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  metadata?: {
    aqi?: number
    location?: string
    category?: string
  }
}
```

### AQIMetadata  
```tsx
interface AQIMetadata {
  aqi: number
  location: string
  pm25: number
  pm10: number
  lastUpdated: string
  temperature: number
  humidity: number
}
```

## Conseils d'Utilisation

### Performance
- Les données se mettent à jour automatiquement toutes les 5 minutes
- L'API Gemini est appelée uniquement lors d'envoi de messages
- Les animations sont optimisées pour éviter les re-renders

### Accessibilité
- Support clavier complet
- Contrast ratio respecté pour le mode sombre
- Focus management automatique
- Labels appropriés pour les icônes

### Responsive Design
- Largeur fixe sur desktop (384px)
- S'adapte à la hauteur d'écran disponible
- Position fixe en bas à droite
- Padding approprié sur mobile