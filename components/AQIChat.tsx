'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Send, MessageCircle, X, Bot, User, Loader2, Wind, MapPin, Activity } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { mockLocationData, getAQILevel, LocationDataType } from '@/lib/types'
import { answerUserQuestion } from '@/lib/AIAnalysisFunction'

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

interface AQIMetadata {
    aqi: number
    location: string
    pm25: number
    pm10: number
    lastUpdated: string
    temperature: number
    humidity: number
}

type Props = {
    data: LocationDataType
}

const AQIChat = ({ data }: Props) => {
    const [showChat, setShowChat] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Bonjour ! Je suis votre assistant AQI. Je peux vous aider avec des informations sur la qualité de l'air et des conseils de santé. Que souhaitez-vous savoir ?",
            isUser: false,
            timestamp: new Date(),
            metadata: {
                category: 'greeting'
            }
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [currentMetadata, setCurrentMetadata] = useState<AQIMetadata>({
        aqi: data.aqi,
        location: data.name,
        pm25: data.pm25,
        pm10: data.pm10,
        lastUpdated: data.lastUpdated,
        temperature: data.temperature,
        humidity: data.humidity
    })

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (showChat && chatInputRef.current) {
            chatInputRef.current.focus()
        }
    }, [showChat])

    const generateGeminiResponse = async (userMessage: string): Promise<string> => {
        try {
            // Configuration de l'API Gemini (vous devez ajouter votre clé API)
            const context = `
                    Vous êtes un assistant spécialisé en qualité de l'air (AQI). 
                    Données actuelles:
                    - Localisation: ${currentMetadata.location}
                    - AQI: ${currentMetadata.aqi} (${getAQILevel(currentMetadata.aqi).level})
                    - PM2.5: ${currentMetadata.pm25} µg/m³
                    - PM10: ${currentMetadata.pm10} µg/m³
                    - Température: ${currentMetadata.temperature}°C
                    - Humidité: ${currentMetadata.humidity}%
                    - Dernière mise à jour: ${currentMetadata.lastUpdated}

                    Répondez en français de manière concise et pratique. Donnez des conseils de santé spécifiques basés sur ces données.
                    Sois précis et évite les généralités. Si la question n'est pas liée à l'AQI, indique poliment que tu ne peux répondre qu'à des questions sur la qualité de l'air.
                    Ne dépasse pas 150 mots dans ta réponse.
                    Evite les caractères spéciaux inutiles dans ta réponse.
                    Fournis ta réponse en texte brut sans formatage markdown.
            `

            const prompt = `${context}\n\nQuestion de l'utilisateur: ${userMessage}`

            const result = await answerUserQuestion({ prompt })
            return result
        } catch (error) {
            console.error('Erreur API Gemini:', error)
            return "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer plus tard."
        }
    }

    const handleSendMessage = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            isUser: true,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await generateGeminiResponse(input)

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                isUser: false,
                timestamp: new Date(),
                metadata: {
                    aqi: currentMetadata.aqi,
                    location: currentMetadata.location,
                    category: 'aqi_advice'
                }
            }

            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            console.error('Erreur:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const aqiLevel = getAQILevel(currentMetadata.aqi)
    
    // Fonction pour obtenir les couleurs de gradient basées sur l'AQI
    const getAQIGradient = (aqi: number) => {
        const level = getAQILevel(aqi)
        switch (level.level) {
            case 'Good':
                return 'from-green-400 to-green-600'
            case 'Moderate':
                return 'from-yellow-400 to-amber-500'
            case 'Unhealthy for Sensitive Groups':
                return 'from-orange-400 to-orange-600'
            case 'Unhealthy':
                return 'from-red-400 to-red-600'
            case 'Very Unhealthy':
                return 'from-purple-400 to-purple-600'
            case 'Hazardous':
                return 'from-red-700 to-red-900'
            default:
                return 'from-blue-500 to-purple-600'
        }
    }

    // Fonction pour obtenir la couleur de fond basée sur l'AQI (plus subtile pour le panel)
    const getAQIBackground = (aqi: number) => {
        const level = getAQILevel(aqi)
        switch (level.level) {
            case 'Good':
                return 'bg-green-50/90 dark:bg-green-900/30 border-green-200/60 dark:border-green-700/40'
            case 'Moderate':
                return 'bg-yellow-50/90 dark:bg-yellow-900/30 border-yellow-200/60 dark:border-yellow-700/40'
            case 'Unhealthy for Sensitive Groups':
                return 'bg-orange-50/90 dark:bg-orange-900/30 border-orange-200/60 dark:border-orange-700/40'
            case 'Unhealthy':
                return 'bg-red-50/90 dark:bg-red-900/30 border-red-200/60 dark:border-red-700/40'
            case 'Very Unhealthy':
                return 'bg-purple-50/90 dark:bg-purple-900/30 border-purple-200/60 dark:border-purple-700/40'
            case 'Hazardous':
                return 'bg-red-100/90 dark:bg-red-950/40 border-red-300/60 dark:border-red-800/50'
            default:
                return 'bg-white/80 dark:bg-gray-900/80 border-white/20'
        }
    }

    // Fonction pour obtenir la couleur de l'header basée sur l'AQI
    const getAQIHeaderGradient = (aqi: number) => {
        const level = getAQILevel(aqi)
        switch (level.level) {
            case 'Good':
                return 'from-green-500 to-emerald-600'
            case 'Moderate':
                return 'from-yellow-500 to-amber-600'
            case 'Unhealthy for Sensitive Groups':
                return 'from-orange-500 to-red-500'
            case 'Unhealthy':
                return 'from-red-500 to-red-600'
            case 'Very Unhealthy':
                return 'from-purple-500 to-violet-600'
            case 'Hazardous':
                return 'from-red-600 to-red-800'
            default:
                return 'from-blue-500 to-purple-600'
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Toggle Button */}
            <motion.div
                onClick={() => setShowChat(!showChat)}
                className="relative w-16 h-16 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <div className={`
          absolute inset-0 rounded-full bg-gradient-to-br ${getAQIGradient(currentMetadata.aqi)}
          shadow-lg backdrop-blur-sm border border-white/20
          ${showChat ? 'rotate-180' : 'rotate-0'}
          transition-all duration-300 ease-out
        `}>
                    <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {showChat ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="w-6 h-6 text-white" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chat"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Chat Panel */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.3
                        }}
                        className={`absolute bottom-20 right-0 w-96 h-[500px] 
              ${getAQIBackground(currentMetadata.aqi)} backdrop-blur-xl 
              rounded-2xl shadow-2xl border
              overflow-hidden flex flex-col z-100`}
                    >
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${getAQIHeaderGradient(currentMetadata.aqi)} p-4 text-white`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Wind className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Assistant AQI</h3>
                                        <p className="text-xs opacity-80">Conseils en qualité de l'air</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${aqiLevel.bgColor}`}>
                                        AQI {currentMetadata.aqi}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info Bar */}
                            <div className="mt-3 flex items-center justify-between text-xs bg-white/20 rounded-lg p-2 border border-white/30">
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate max-w-24">{currentMetadata.location.split(',')[0]}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Activity className="w-3 h-3" />
                                    <span>PM2.5: {currentMetadata.pm25}µg/m³</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isUser
                                                ? `bg-gradient-to-br ${getAQIGradient(currentMetadata.aqi)}`
                                                : 'bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-500'
                                            }`}>
                                            {message.isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                        </div>

                                        <div className={`rounded-2xl px-4 py-2 ${message.isUser
                                                ? `bg-gradient-to-br ${getAQIGradient(currentMetadata.aqi)} text-white`
                                                : `bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${message.metadata?.category === 'aqi_advice' ? 'border-l-4 ' + aqiLevel.bgColor.replace('bg-', 'border-') : ''}`
                                            }`}>
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                            {message.metadata?.category === 'aqi_advice' && (
                                                <div className="mt-2 text-xs flex items-center space-x-2 opacity-70">
                                                    <Activity className="w-3 h-3" />
                                                    <span>AQI: {message.metadata.aqi} • {message.metadata.location?.split(',')[0]}</span>
                                                </div>
                                            )}
                                            <p className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-500'
                                                }`}>
                                                {message.timestamp.toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                                            <div className="flex items-center space-x-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Réflexion...</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                            <div className="flex items-center space-x-2">
                                <Input
                                    ref={chatInputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Posez une question sur l'AQI..."
                                    className={`flex-1 rounded-full border-gray-300 dark:border-gray-600 
                    focus:ring-2 focus:ring-${aqiLevel.level === 'Good' ? 'green' : aqiLevel.level === 'Moderate' ? 'yellow' : aqiLevel.level.includes('Unhealthy') ? 'red' : aqiLevel.level === 'Very Unhealthy' ? 'purple' : 'red'}-500 focus:border-transparent
                    bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm`}
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className={`rounded-full w-10 h-10 p-0 bg-gradient-to-r ${getAQIGradient(currentMetadata.aqi)}
                    hover:opacity-90 hover:scale-105
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 ease-out shadow-lg`}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AQIChat