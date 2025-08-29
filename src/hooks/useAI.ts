import { useState, useRef, useCallback, useEffect } from 'react';
import OpenAI from 'openai';
import { toast } from 'sonner';

interface MeditationScript {
  title: string;
  duration: string;
  script: string;
  category?: string;
  tags?: string[];
}

interface TherapySession {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    mood?: string;
    context?: string;
  }>;
  userProfile: {
    age?: number;
    gender?: string;
    culturalBackground?: string;
    primaryConcerns?: string[];
    therapyGoals?: string[];
    familySituation?: string;
    academicPressure?: boolean;
    socialAnxiety?: boolean;
  };
  sessionStart: Date;
  lastActivity: Date;
}

const FALLBACK_AFFIRMATIONS = [
  "I am worthy of love and respect, regardless of my academic performance.",
  "My mental health matters, and taking care of it is a sign of strength.",
  "I can honor my family's values while also honoring my own needs and boundaries.",
  "Every small step I take toward healing is valuable and meaningful.",
  "I deserve support and understanding, especially during difficult times.",
  "My feelings are valid, and it's okay to ask for help when I need it.",
  "I am more than my achievements - I have inherent worth as a person.",
  "I can learn healthy ways to manage stress and pressure.",
];

const MEDITATION_CATEGORIES = [
  'stress-relief', 'anxiety', 'sleep', 'focus', 'self-compassion', 'family-pressure', 'exam-anxiety'
];

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openai = useRef<OpenAI | null>(null);
  const [therapySessions, setTherapySessions] = useState<Record<string, TherapySession>>({});

  // Initialize OpenAI client
  const initializeAI = async () => {
    if (!openai.current) {
      try {
        const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (!API_KEY) {
          console.warn('OpenAI API key not found. Add VITE_OPENAI_API_KEY to your .env file');
          return null;
        }
        
        openai.current = new OpenAI({
          apiKey: API_KEY,
          dangerouslyAllowBrowser: true
        });
      } catch (error) {
        console.error('Failed to initialize OpenAI:', error);
        return null;
      }
    }
    return openai.current;
  };
  // Enhanced therapist response with context awareness
  const getTherapistResponse = async (
    message: string, 
    sessionId: string,
    userContext?: {
      mood?: string;
      previousMessages?: string[];
      userProfile?: any;
    }
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const ai = await initializeAI();
      
      if (!ai) {
        setIsLoading(false);
        const fallbackResponse = getFallbackTherapistResponse(message, userContext);
        // Store the fallback conversation for context
        updateTherapySession(sessionId, message, fallbackResponse, userContext);
        return fallbackResponse;
      }

      // Build comprehensive context for the AI
      const contextBuilder = buildTherapyContext(message, sessionId, userContext);
      
      const systemPrompt = `You are Dr. Priya, a compassionate, culturally-aware Indian therapist specializing in youth mental health. You have 15+ years of experience helping Indian youth navigate family pressure, academic stress, social anxiety, and cultural identity challenges.

CORE THERAPEUTIC PRINCIPLES:
- Always respond with genuine empathy and cultural understanding
- Use "I hear you" and "That sounds really challenging" to validate feelings
- Ask follow-up questions that show you're truly listening
- Provide practical, culturally-appropriate coping strategies
- Maintain professional boundaries while being warm and approachable
- Recognize the unique pressures Indian youth face from family and society

RESPONSE STRUCTURE:
1. Acknowledge and validate their specific concern (1-2 sentences)
2. Show understanding of the cultural context (1 sentence)
3. Ask a thoughtful follow-up question or offer gentle guidance (1-2 sentences)
4. Keep total response to 3-4 sentences maximum

CULTURAL SENSITIVITY:
- Understand Indian family dynamics and expectations
- Recognize academic pressure and career expectations
- Acknowledge social stigma around mental health
- Respect cultural values while supporting individual needs

IMPORTANT: Never give generic advice. Always respond specifically to what they've shared. If they mention family pressure, address that. If they talk about exam stress, focus on that. Make each response feel personal and genuine.`;

      const userPrompt = `User Message: "${message}"

${contextBuilder}

Please provide a genuine, culturally-aware therapeutic response that directly addresses their specific concern.`;

      const completion = await ai.chat.completions.create({
        model: "gpt-4", // Using GPT-4 for better therapeutic responses
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.1, // Encourages more focused responses
        frequency_penalty: 0.1, // Reduces repetitive language
      });

      const response = completion.choices[0]?.message?.content || '';
      setIsLoading(false);
      
      if (!response.trim()) {
        const fallbackResponse = getFallbackTherapistResponse(message, userContext);
        updateTherapySession(sessionId, message, fallbackResponse, userContext);
        return fallbackResponse;
      }

      // Store the conversation for context
      updateTherapySession(sessionId, message, response, userContext);
      
      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      setIsLoading(false);
      const fallbackResponse = getFallbackTherapistResponse(message, userContext);
      // Store the fallback conversation for context
      updateTherapySession(sessionId, message, fallbackResponse, userContext);
      return fallbackResponse;
    }
  };

  // Build comprehensive therapy context
  const buildTherapyContext = (
    currentMessage: string, 
    sessionId: string, 
    userContext?: any
  ): string => {
    const session = therapySessions[sessionId];
    let context = '';

    // Add user profile context
    if (session?.userProfile) {
      const profile = session.userProfile;
      context += `User Profile: ${profile.age || 'Young'} ${profile.gender || 'person'}, `;
      context += `Cultural Background: ${profile.culturalBackground || 'Indian'}, `;
      
      if (profile.primaryConcerns?.length) {
        context += `Primary Concerns: ${profile.primaryConcerns.join(', ')}, `;
      }
      
      if (profile.familySituation) {
        context += `Family Situation: ${profile.familySituation}, `;
      }
      
      if (profile.academicPressure) {
        context += `Experiences academic pressure, `;
      }
      
      if (profile.socialAnxiety) {
        context += `Deals with social anxiety, `;
      }
    }

    // Add conversation history context
    if (session?.messages?.length > 1) {
      const recentMessages = session.messages.slice(-3); // Last 3 messages
      context += `Recent Conversation Context: `;
      recentMessages.forEach(msg => {
        if (msg.role === 'user') {
          context += `User mentioned: "${msg.content.substring(0, 100)}...", `;
        }
      });
    }

    // Add current mood context
    if (userContext?.mood) {
      context += `Current Mood: ${userContext.mood}, `;
    }

    // Add cultural context based on message content
    const lowerMessage = currentMessage.toLowerCase();
    if (lowerMessage.includes('family') || lowerMessage.includes('parents')) {
      context += `Cultural Context: User is dealing with family-related issues common in Indian households, `;
    }
    if (lowerMessage.includes('exam') || lowerMessage.includes('study')) {
      context += `Cultural Context: User is experiencing academic pressure typical in Indian education system, `;
    }
    if (lowerMessage.includes('marriage') || lowerMessage.includes('arranged')) {
      context += `Cultural Context: User may be dealing with marriage-related family expectations, `;
    }

    return context;
  };

  // Update therapy session with new conversation
  const updateTherapySession = (
    sessionId: string, 
    userMessage: string, 
    aiResponse: string, 
    userContext?: any
  ) => {
    const session = therapySessions[sessionId] || {
      id: sessionId,
      messages: [],
      userProfile: {},
      sessionStart: new Date(),
      lastActivity: new Date()
    };

    // Add new messages
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      mood: userContext?.mood,
      context: userContext?.context
    });

    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    session.lastActivity = new Date();

    // Update session
    setTherapySessions(prev => ({
      ...prev,
      [sessionId]: session
    }));
  };

  // Enhanced fallback responses with better context
  const getFallbackTherapistResponse = (message: string, userContext?: any): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('family') || lowerMessage.includes('parents')) {
      return "I hear that family dynamics are really challenging for you right now. In Indian families, there's often this delicate balance between respecting traditions and honoring your own path. Can you tell me more about what specific family pressures you're experiencing? I want to understand your situation better so I can offer more targeted support.";
    } 
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('study') || lowerMessage.includes('academic')) {
      return "Academic stress is incredibly common among students in India - the pressure to excel can feel absolutely overwhelming. I can hear how much this is weighing on you. What aspect of your studies is causing you the most anxiety right now? Understanding the specific challenges you're facing will help me give you more relevant guidance.";
    } 
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
      return "Anxiety can be really challenging to deal with, and I appreciate you reaching out about it. That takes real courage. Have you noticed any particular situations or thoughts that tend to trigger your anxiety? The more I understand about your specific experience, the better I can help you develop coping strategies that work for you.";
    } 
      if (lowerMessage.includes('sad') || lowerMessage.includes('depression') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      return "I'm sorry you're feeling this way - depression can make everything feel so much more difficult. You don't have to carry this alone, and reaching out shows real strength. Can you tell me more about how long you've been feeling this way and what might have triggered it? I want to understand your journey better.";
    }
    
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
      return "Feeling lonely can be really hard, especially when you're surrounded by people who don't seem to understand what you're going through. That isolation can make everything feel even more challenging. What would help you feel more connected right now? Sometimes just identifying what we need can be the first step toward feeling better.";
    }
    
    if (lowerMessage.includes('pressure') || lowerMessage.includes('stress')) {
      return "It sounds like you're dealing with a lot of pressure right now, and that can feel absolutely overwhelming. I want to understand your situation better so I can offer more targeted support. What's the main source of stress in your life at the moment? Sometimes just talking through it can help us see things more clearly.";
    }
    
    return "I hear that you're going through a challenging time, and I want to make sure I understand your situation properly so I can offer the most helpful support. Can you tell me more specifically about what's been weighing on your mind lately? The more I understand about your experience, the better I can help you navigate through this.";
  };

  // Get personalized therapy insights
  const getTherapyInsights = async (sessionId: string): Promise<string> => {
    const session = therapySessions[sessionId];
    if (!session || session.messages.length < 4) {
      return "I need to get to know you better through our conversations to provide personalized insights. Let's continue talking so I can understand your situation more deeply.";
    }

    try {
      const ai = await initializeAI();
      if (!ai) {
        return getFallbackInsights(session);
      }

      const systemPrompt = `You are a skilled therapist analyzing a therapy session. Provide 2-3 specific insights about the user's patterns, concerns, and potential growth areas. Be encouraging but realistic.`;

      const userPrompt = `Analyze this therapy session and provide insights:

Session Duration: ${Math.round((new Date().getTime() - session.sessionStart.getTime()) / (1000 * 60 * 60 * 24))} days
Messages: ${session.messages.length}
User Profile: ${JSON.stringify(session.userProfile)}

Recent User Messages:
${session.messages.filter(m => m.role === 'user').slice(-5).map(m => `- "${m.content}"`).join('\n')}

Provide 2-3 specific, encouraging insights about patterns, concerns, and growth areas.`;

      const completion = await ai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.6,
      });

      return completion.choices[0]?.message?.content || getFallbackInsights(session);
    } catch (error) {
      return getFallbackInsights(session);
    }
  };

  const getFallbackInsights = (session: TherapySession): string => {
    const userMessages = session.messages.filter(m => m.role === 'user');
    const concerns = userMessages.map(m => m.content.toLowerCase());
    
    let insight = "Based on our conversations, I can see you're dealing with some real challenges. ";
    
    if (concerns.some(c => c.includes('family'))) {
      insight += "Family dynamics seem to be a significant source of stress for you. ";
    }
    if (concerns.some(c => c.includes('exam') || c.includes('study'))) {
      insight += "Academic pressure is clearly weighing on you. ";
    }
    if (concerns.some(c => c.includes('anxious') || c.includes('sad'))) {
      insight += "You're experiencing some difficult emotions that deserve attention. ";
    }
    
    insight += "Remember, seeking support shows real strength, and you're taking positive steps toward feeling better.";
    
    return insight;
  };

  const getMythBusterResponse = async (myth: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      const ai = await initializeAI();
      
      if (!ai) {
        return getFallbackMythResponse();
      }

      const model = ai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a mental health expert debunking common myths. Provide clear, factual information that's easy to understand." 
          },
          { 
            role: "user", 
            content: `Please debunk this mental health myth: "${myth}"

Provide:
1. Why this is a misconception
2. The scientific truth
3. Cultural context for India
4. A supportive message

Keep it concise and educational.` 
          }
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      const response = await model;
      const text = response.choices[0]?.message?.content || '';
      
      setIsLoading(false);
      
      if (!text.trim()) {
        return getFallbackMythResponse();
      }
      
      return text;
    } catch (error) {
      console.error('OpenAI API error:', error);
      setIsLoading(false);
      return getFallbackMythResponse();
    }
  };

  const getFallbackMythResponse = (): string => {
    const responses = [
      "That's a common misconception! Mental health challenges are medical conditions, not signs of weakness. Just like we wouldn't blame someone for having diabetes, we shouldn't blame anyone for depression or anxiety.",
      "Actually, talking about mental health doesn't make problems worse - it often helps! Research shows that expressing feelings and seeking support leads to better outcomes.",
      "This myth is harmful but unfortunately common. Mental health conditions affect people of all backgrounds, cultures, and social classes. They're not a sign of being 'ungrateful' or having character flaws.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getRandomAffirmation = (): string => {
    return FALLBACK_AFFIRMATIONS[Math.floor(Math.random() * FALLBACK_AFFIRMATIONS.length)];
  };

  const getPersonalizedAffirmation = async (userContext?: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      const ai = await initializeAI();
      
      if (!ai) {
        return getFallbackPersonalizedAffirmation(userContext);
      }

      const completion = await ai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an expert at creating personalized, empowering affirmations. Create affirmations that are specific, realistic, and culturally aware." 
          },
          { 
            role: "user", 
            content: `Create a personalized affirmation for someone experiencing: "${userContext || 'general stress'}"

Requirements:
- Make it specific to their situation
- Use "I" statements
- Be empowering but realistic
- Consider Indian cultural context
- Keep it to 1-2 sentences maximum
- Make it something they can actually believe and feel

Affirmation:` 
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      setIsLoading(false);
      
      if (!response.trim()) {
        return getFallbackPersonalizedAffirmation(userContext);
      }
      
      return response.replace(/^Affirmation:\s*/i, '').trim();
    } catch (error) {
      console.error('OpenAI API error:', error);
      setIsLoading(false);
      return getFallbackPersonalizedAffirmation(userContext);
    }
  };

  const getFallbackPersonalizedAffirmation = (userContext?: string): string => {
    if (userContext?.toLowerCase().includes('exam')) {
      return "I am prepared and capable. I will do my best and trust in my abilities.";
    } else if (userContext?.toLowerCase().includes('family')) {
      return "I can love my family while also honoring my own path and needs.";
    }
    return getRandomAffirmation();
  };

  const generateMeditationScript = async (category: string, duration: number = 5): Promise<MeditationScript> => {
    setIsLoading(true);
    
    try {
      const ai = await initializeAI();
      
      if (!ai) {
        return getFallbackMeditation(category, duration);
      }

      const completion = await ai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are Dr. Priya, an experienced meditation guide and therapist specializing in helping Indian youth. Create deeply calming, culturally-sensitive guided meditation scripts that address the unique pressures faced by young people in India - academic stress, family expectations, social pressures, and identity formation. Use soothing language, incorporate breathing techniques, progressive relaxation, and meaningful visualizations." 
          },
          { 
            role: "user", 
            content: `Create a comprehensive guided meditation script for "${category}" lasting ${duration} minutes.

Requirements:
- Start with grounding and breathing instructions (30-60 seconds)
- Include progressive relaxation techniques
- Add meaningful visualizations relevant to Indian cultural context
- Address specific concerns related to "${category}"
- Use warm, compassionate, and culturally-aware language
- Include positive affirmations and self-compassion elements
- Structure with natural pauses indicated by "..."
- End with gentle transition back to awareness
- Make it flow naturally like a real meditation session

The meditation should feel personal, supportive, and deeply calming. Focus on the specific challenges that "${category}" represents for Indian youth.

Script:` 
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      setIsLoading(false);
      
      if (!response.trim()) {
        return getFallbackMeditation(category, duration);
      }
      
      return {
        title: `AI-Generated ${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Meditation`,
        duration: `${duration} minutes`,
        script: response.replace(/^Script:\s*/i, '').trim(),
        category,
        tags: [category, 'ai-generated', 'personalized', 'culturally-aware']
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      setIsLoading(false);
      return getFallbackMeditation(category, duration);
    }
  };

  const getFallbackMeditation = (category: string, duration: number): MeditationScript => {
    const scripts = {
      'stress-relief': `🧘‍♀️ **STRESS RELIEF MEDITATION** 🧘‍♀️

**Welcome and Settling (0-1 minute)**
Find a comfortable seated position with your spine straight but relaxed... Close your eyes and take three deep breaths, letting each exhale release the tension from your day...

**Body Awareness (1-3 minutes)**
Feel your shoulders dropping with each breath... Notice where you hold stress in your body and consciously release it... 

**River Visualization (3-5 minutes)**
Imagine you're sitting beside a peaceful river in the hills... The gentle sound of flowing water washes away your stress... With each breath, feel your body becoming lighter... more relaxed...

**Integration**
Continue breathing naturally as you let go of all pressures and worries... You are safe in this moment... you are enough just as you are... Stay here, feeling completely at peace...`,

      'anxiety': `😌 **ANXIETY RELIEF MEDITATION** 😌

**Grounding (0-1 minute)**
Sit comfortably and place one hand on your chest, one on your belly... Feel your connection to the present moment...

**Breath Regulation (1-4 minutes)**
Feel your natural breathing rhythm... Now breathe slowly into your belly for four counts... hold for two... exhale for six counts... This activates your body's natural calming response...

**Cloud Visualization (4-6 minutes)**
Imagine anxiety as passing clouds in the vast sky of your mind... These clouds are temporary... they will move on... You are the constant, peaceful sky beneath...

**Affirmation**
With each exhale, feel the clouds of worry drifting away... You have weathered storms before and you will weather this one too... Continue breathing, feeling grounded and secure...`,

      'sleep': `🌙 **SLEEP PREPARATION MEDITATION** 🌙

**Initial Relaxation (0-2 minutes)**
Lie down comfortably and close your eyes... Take three cleansing breaths, letting your body sink deeper into your bed with each exhale...

**Body Scan (2-8 minutes)**
Starting with your toes, feel them relaxing completely... Move up to your feet, ankles, calves... each part becoming heavy and loose... Continue through your legs, hips, back... arms, shoulders, neck...

**Peaceful Imagery (8-10 minutes)**
Your entire body is now deeply relaxed... Imagine lying under a starry sky, feeling completely safe and peaceful... Let your mind drift as you prepare for restorative sleep...`,

      'focus': `🎯 **FOCUS ENHANCEMENT MEDITATION** 🎯

**Posture and Preparation (0-1 minute)**
Sit with your spine erect but comfortable... Close your eyes and take five deep breaths, counting each one...

**Breath Focus Training (1-5 minutes)**
Focus on the sensation of breathing naturally... Notice the air entering and leaving your nostrils... When your mind wanders, that's perfectly normal... gently guide your attention back to your breath...

**Concentration Building (5-7 minutes)**
Each time you notice wandering and return to focus, you're strengthening your concentration... Your mind is becoming like still, clear water... peaceful and focused... Continue feeling your mental clarity sharpening...`,

      'self-compassion': `💖 **SELF-COMPASSION MEDITATION** 💖

**Heart Connection (0-2 minutes)**
Place both hands on your heart and feel its gentle rhythm... This heart has carried you through every experience... Take a deep breath and say: 'I am worthy of love and kindness'...

**Compassion Cultivation (2-6 minutes)**
Think of how you'd comfort a dear friend who was struggling... Feel that same warm compassion... and offer it to yourself...

**Loving Affirmations (6-8 minutes)**
Repeat: 'May I be kind to myself... May I give myself the compassion I need... May I remember that I am enough'... Feel this loving-kindness surrounding you like a warm embrace...`,

      'family-pressure': `👨‍👩‍👧‍👦 **FAMILY PRESSURE RELIEF** 👨‍👩‍👧‍👦

**Acknowledgment (0-1 minute)**
Take a deep breath and acknowledge that wanting to honor your family while being true to yourself shows maturity... Place one hand on your heart...

**Authentic Self Connection (1-4 minutes)**
Feel your own authentic self... strong and valuable... Imagine being surrounded by golden light representing your true nature...

**Balance and Harmony (4-6 minutes)**
You can love your family deeply while also honoring your own path... Breathe and repeat: 'I can find balance between family love and personal authenticity'... You are capable of creating harmony...`,

      'exam-anxiety': `📚 **EXAM ANXIETY SUPPORT** 📚

**Validation (0-1 minute)**
Close your eyes and take three calming breaths... Acknowledge that pre-exam nerves show you care... that's completely normal...

**Mind Calming (1-4 minutes)**
Imagine your mind as a clear, calm lake... Any anxious thoughts are just temporary ripples on the surface... With each breath, the water becomes stiller...

**Success Visualization (4-6 minutes)**
Visualize yourself feeling confident and prepared... See yourself accessing your knowledge with ease... Repeat: 'I am prepared, I am capable, I will do my best'... Your worth isn't determined by any exam... You are valuable just as you are...`
    };
    
    return {
      title: `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Meditation`,
      duration: `${duration} minutes`,
      script: scripts[category as keyof typeof scripts] || scripts['stress-relief'],
      category,
      tags: [category, 'guided-meditation', 'comprehensive', 'detailed-format']
    };
  };

  const getStigmaSupport = async (situation: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      const ai = await initializeAI();
      
      if (!ai) {
        return getFallbackStigmaResponse();
      }

      const completion = await ai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a mental health advocate providing support for people facing stigma. Be compassionate, practical, and empowering." 
          },
          { 
            role: "user", 
            content: `Provide compassionate support for someone facing mental health stigma: "${situation}"

Include:
- Validation of their experience
- Practical strategies for dealing with stigma
- Cultural context for India
- Empowerment and hope
- Resources or next steps

Keep response supportive and actionable.` 
          }
        ],
        max_tokens: 250,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content || '';
      setIsLoading(false);
      
      if (!response.trim()) {
        return getFallbackStigmaResponse();
      }
      
      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      setIsLoading(false);
      return getFallbackStigmaResponse();
    }
  };

  const getFallbackStigmaResponse = (): string => {
    return "I understand that facing stigma around mental health can feel isolating and frustrating. Your feelings are valid, and seeking help is actually a sign of strength, not weakness. Remember that mental health is just as important as physical health. Consider starting with trusted friends or family members, and know that professional support is available when you're ready.";
  };
  // OpenAI Text-to-Speech with improved fallback
  // Helper function to clean meditation script for voice
  const cleanScriptForVoice = (text: string): string => {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      // Remove emojis
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Remove section markers and timestamps
      .replace(/\(\d+-?\d*\s*minutes?\)/gi, '')
      // Add natural pauses
      .replace(/\.\.\./g, '. ')
      .replace(/\n\n/g, '. ')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Split long text into chunks for better TTS handling
  const splitIntoChunks = (text: string, maxLength: number = 4000): string[] => {
    const sentences = text.split(/[.!?]+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 0);
  };

  const textToSpeech = async (text: string, options: { 
    onProgress?: (progress: number) => void;
    onChunkStart?: (chunkIndex: number, totalChunks: number) => void;
    signal?: AbortSignal;
    speed?: number;
    volume?: number;
  } = {}): Promise<void> => {
    try {
      const ai = await initializeAI();
      const cleanedText = cleanScriptForVoice(text);
      const chunks = splitIntoChunks(cleanedText);
      
      if (!ai) {
        // Fallback to browser TTS with chunking support
        return new Promise((resolve, reject) => {
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            let currentChunkIndex = 0;
            
            const speakChunk = (chunkIndex: number) => {
              if (options.signal?.aborted) {
                speechSynthesis.cancel();
                reject(new Error('Aborted'));
                return;
              }
              
              if (chunkIndex >= chunks.length) {
                resolve();
                return;
              }
              
              options.onChunkStart?.(chunkIndex, chunks.length);
              options.onProgress?.((chunkIndex / chunks.length) * 100);
              
              const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
              utterance.rate = options.speed || 1.0; // Use normal speed
              utterance.pitch = 1.0; // Use natural pitch
              utterance.volume = options.volume || 0.8;
              
            // Only use young, soft female voices for AI-Therapist
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
              // First priority: Young female voices with higher pitch
              voice.name.toLowerCase().includes('jenny') ||
              voice.name.toLowerCase().includes('aria') ||
              voice.name.toLowerCase().includes('samantha') ||
              voice.name.toLowerCase().includes('girl') ||
              voice.name.toLowerCase().includes('child') ||
              // Second priority: Soft female voices (not Microsoft which tend to be deeper)
              (voice.name.toLowerCase().includes('female') && 
               !voice.name.toLowerCase().includes('microsoft') && 
               !voice.name.toLowerCase().includes('adult')) ||
              voice.name.toLowerCase().includes('zira') ||
              voice.name.toLowerCase().includes('eva')
            ) || voices.find(voice => 
              // Fallback: Any voice that's not male and not mature-sounding
              voice.lang.startsWith('en') && 
              !voice.name.toLowerCase().includes('male') &&
              !voice.name.toLowerCase().includes('man') &&
              !voice.name.toLowerCase().includes('adult') &&
              !voice.name.toLowerCase().includes('mature') &&
              !voice.name.toLowerCase().includes('deep') &&
              !voice.name.toLowerCase().includes('david') &&
              !voice.name.toLowerCase().includes('mark') &&
              !voice.name.toLowerCase().includes('james') &&
              !voice.name.toLowerCase().includes('microsoft')
            );
              if (preferredVoice) {
                utterance.voice = preferredVoice;
              }
              
              utterance.onend = () => {
                speakChunk(chunkIndex + 1);
              };
              utterance.onerror = (error) => {
                console.error('Browser TTS error:', error);
                reject(error);
              };
              
              speechSynthesis.speak(utterance);
            };
            
            speakChunk(0);
          } else {
            reject(new Error('Speech synthesis not supported'));
          }
        });
      }

      // Use OpenAI TTS for better quality
      for (let i = 0; i < chunks.length; i++) {
        if (options.signal?.aborted) {
          throw new Error('Aborted');
        }
        
        options.onChunkStart?.(i, chunks.length);
        options.onProgress?.((i / chunks.length) * 100);
        
        const mp3 = await ai.audio.speech.create({
          model: "tts-1-hd", // Use HD model for better quality  
          voice: "nova", // Soft, warm female voice - sounds younger and gentler
          input: chunks[i],
          speed: options.speed || 1.1 // Slightly faster speed for younger sound
        });

        const audioBuffer = await mp3.arrayBuffer();
        const audioContext = new AudioContext();
        const audioData = await audioContext.decodeAudioData(audioBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioData;
        source.connect(audioContext.destination);
        
        await new Promise((resolve, reject) => {
          source.onended = () => resolve(undefined);
          
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              try {
                source.stop();
              } catch (e) {
                // Source might already be stopped
              }
              reject(new Error('Aborted'));
            });
          }
          
          try {
            source.start();
          } catch (error) {
            console.error('OpenAI TTS playback error:', error);
            reject(error);
          }
        });
        
        // Small pause between chunks for natural flow
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      options.onProgress?.(100);
    } catch (error) {
      console.error('OpenAI TTS error, falling back to browser TTS:', error);
      
      // Fallback to browser TTS with chunking support
      return new Promise((resolve, reject) => {
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
          
          const cleanedText = cleanScriptForVoice(text);
          const chunks = splitIntoChunks(cleanedText);
          let currentChunkIndex = 0;
          
          const speakChunk = (chunkIndex: number) => {
            if (options.signal?.aborted) {
              speechSynthesis.cancel();
              reject(new Error('Aborted'));
              return;
            }
            
            if (chunkIndex >= chunks.length) {
              resolve();
              return;
            }
            
            options.onChunkStart?.(chunkIndex, chunks.length);
            options.onProgress?.((chunkIndex / chunks.length) * 100);
            
            const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
            utterance.rate = options.speed || 1.1; // Slightly faster for younger sound
            utterance.pitch = 1.1; // Higher pitch for younger voice
            utterance.volume = options.volume || 0.8;
            
            // Only use young, soft female voices for AI-Therapist
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
              // First priority: Young female voices with higher pitch
              voice.name.toLowerCase().includes('jenny') ||
              voice.name.toLowerCase().includes('aria') ||
              voice.name.toLowerCase().includes('samantha') ||
              voice.name.toLowerCase().includes('girl') ||
              voice.name.toLowerCase().includes('child') ||
              // Second priority: Soft female voices (not Microsoft which tend to be deeper)
              (voice.name.toLowerCase().includes('female') && 
               !voice.name.toLowerCase().includes('microsoft') && 
               !voice.name.toLowerCase().includes('adult')) ||
              voice.name.toLowerCase().includes('zira') ||
              voice.name.toLowerCase().includes('eva')
            ) || voices.find(voice => 
              // Fallback: Any voice that's not male and not mature-sounding
              voice.lang.startsWith('en') && 
              !voice.name.toLowerCase().includes('male') &&
              !voice.name.toLowerCase().includes('man') &&
              !voice.name.toLowerCase().includes('adult') &&
              !voice.name.toLowerCase().includes('mature') &&
              !voice.name.toLowerCase().includes('deep') &&
              !voice.name.toLowerCase().includes('david') &&
              !voice.name.toLowerCase().includes('mark') &&
              !voice.name.toLowerCase().includes('james') &&
              !voice.name.toLowerCase().includes('microsoft')
            );
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }
            
            utterance.onend = () => {
              speakChunk(chunkIndex + 1);
            };
            utterance.onerror = (error) => {
              console.error('Browser TTS error:', error);
              reject(error);
            };
            
            speechSynthesis.speak(utterance);
          };
          
          speakChunk(0);
        } else {
          reject(new Error('Speech synthesis not supported'));
        }
      });
    }
  };

  // OpenAI Automatic Speech Recognition
  const speechToText = async (audioBlob: Blob): Promise<string> => {
    setIsLoading(true);
    
    try {
      const ai = await initializeAI();
      
      if (!ai) {
        setIsLoading(false);
        throw new Error('OpenAI client not available');
      }

      // Convert blob to file
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

      const transcription = await ai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en", // Can be changed to support multiple languages
        response_format: "text"
      });

      setIsLoading(false);
      return transcription as string;
    } catch (error) {
      console.error('OpenAI ASR error:', error);
      setIsLoading(false);
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  };

  const getAllMeditations = () => {
    return [
      {
        title: "Stress Relief Meditation",
        duration: "5-10 minutes",
        script: `🧘‍♀️ **STRESS RELIEF MEDITATION** 🧘‍♀️

**Welcome and Settling In (0-1 minute)**
Welcome to this stress relief meditation... Find a comfortable seated position with your feet flat on the floor and your hands resting gently on your thighs... Close your eyes softly, or keep them slightly open with a gentle downward gaze...

Take a moment to notice how you're feeling right now... acknowledging any stress, tension, or overwhelm without judgment... This is your time to release and restore...

**Initial Breathing (1-2 minutes)**
Begin by taking three deep, cleansing breaths... In through your nose for four counts... and out through your mouth for six counts... 

With each exhale, consciously let go of the stress from your day... the pressure from work or studies... the weight of expectations... Just breathe it all away...

**Body Relaxation (2-4 minutes)**
Now, starting from the top of your head, begin to scan down through your body... Notice your forehead... let it soften and smooth... Your eyes... releasing any strain... Your jaw... let it drop open slightly...

Feel your shoulders... so often they carry the weight of our stress... Let them drop down away from your ears... Feel your arms becoming heavy and relaxed... your chest expanding freely with each breath...

Move your attention to your back... releasing tension from your spine... your lower back where stress often accumulates... Let it all melt away...

**River Visualization (4-7 minutes)**
Now, imagine yourself sitting beside a peaceful river... The water flows gently, with a soft, rhythmic sound that matches your breathing... This river has the magical ability to carry away whatever you no longer need...

See your stress, your worries, your overwhelm as leaves floating on the surface of this river... Watch them drift away downstream... Each breath helps them move further from you...

The riverbank where you sit is warm and safe... You are supported by the earth beneath you... The gentle breeze carries the fresh scent of water and growing things... You are completely safe here...

**Affirmations and Integration (7-9 minutes)**
As you continue to breathe naturally, repeat these healing words to yourself:
"I release what I cannot control..."
"I am safe in this moment..."
"I choose peace over pressure..."
"I am enough, just as I am..."

Feel these truths settling into your heart... into your nervous system... You have everything within you to handle life's challenges with grace and ease...

**Gentle Return (9-10 minutes)**
In a few moments, you'll open your eyes, but first... take three more deep breaths... feeling refreshed and renewed... 

Wriggle your fingers and toes... roll your shoulders gently... When you're ready, slowly open your eyes...

Carry this sense of calm with you... knowing you can return to this peaceful state whenever you need it... You are resilient, capable, and at peace.`,
        category: "stress-relief",
        tags: ["stress-relief", "breathing", "relaxation"]
      },
      {
        title: "Anxiety Relief Meditation",
        duration: "5-10 minutes", 
        script: `😌 **ANXIETY RELIEF MEDITATION** 😌

**Grounding and Connection (0-1 minute)**
This meditation will help you find calm amidst anxiety... Sit comfortably with your back supported... Place one hand on your chest, the other on your belly... 

Feel the weight of your body in the chair... your feet connected to the floor... You are safe and grounded in this moment...

**Breath Awareness (1-3 minutes)**
Feel the natural rhythm of your breathing without trying to change it... Notice which hand moves more as you breathe... This is perfectly normal and exactly as it should be...

Now, slowly begin to breathe deeper into your belly... In for four counts: 1... 2... 3... 4... Hold gently for two counts... Out for six slow counts: 1... 2... 3... 4... 5... 6...

This longer exhale activates your body's natural calming response... your parasympathetic nervous system... the part of you that knows how to heal and restore...

**Cloud Visualization (3-6 minutes)**
As you continue this gentle breathing pattern, imagine your mind as a vast, open sky... Any anxious thoughts or feelings are like clouds passing through this sky...

Some clouds might be dark and heavy... others light and wispy... But notice - they are all temporary... they all pass through... Your breath is like a gentle wind, helping them move along...

With each exhale, see the clouds of worry drifting away... dissolving into the distance... You are not these temporary clouds... You are the eternal, peaceful sky beneath...

Constant... spacious... unshakeable...

**Anchoring Practice (6-8 minutes)**
Your breath is your anchor in any storm... When anxious thoughts arise, and they will, simply return to your breath... to this moment... to the feeling of your body supported and safe...

Repeat these calming affirmations:
"This feeling is temporary..."
"I am safe in this moment..."
"I have weathered difficult times before..."
"I trust in my ability to cope..."
"I am stronger than my anxiety..."

**Gentle Closing (8-10 minutes)**
Continue breathing... feeling more grounded and centered with each breath... Your nervous system is calming... your mind is clearing... your heart is opening to peace...

Take three more conscious breaths... In... and out... In... and out... In... and out...

When you're ready, gently open your eyes... Move slowly... This calm is yours to keep... You can access it anytime by returning to your breath.`,
        category: "anxiety",
        tags: ["anxiety", "breathing", "visualization"]
      },
      {
        title: "Sleep Preparation Meditation",
        duration: "10-15 minutes",
        script: `🌙 **SLEEP PREPARATION MEDITATION** 🌙

**Settling Into Bed (0-1 minute)**
This meditation will prepare your body and mind for deep, restorative sleep... Lie down comfortably in your bed, adjusting your pillows and blankets until you feel completely supported...

Close your eyes and take three deep, cleansing breaths... Let each exhale be a sigh of relief... releasing the day... welcoming rest...

**Progressive Body Scan (1-8 minutes)**
Now we'll begin a gentle body scan, systematically relaxing every part of your body...

**Starting with your toes** (1-2 minutes)
Bring your attention to your toes... wiggle them gently, then let them relax completely... Feel them becoming heavy and warm... Any tension melting away...

Move to your feet... your ankles... feel them sinking into the mattress... your calves... let them become loose and heavy... your knees... releasing any tightness...

**Moving through your lower body** (2-4 minutes)
Continue up through your thighs... powerful muscles that have carried you through the day... let them rest now... your hips... releasing and opening... your lower back... where so much stress accumulates... breathe into this area and let it soften...

Feel your entire lower body becoming deeply relaxed... heavy... sinking into the bed...

**Relaxing your torso** (4-6 minutes)
Bring attention to your abdomen... let it rise and fall naturally with your breath... your chest... allow it to open and expand freely... your ribs... softening with each exhale...

Your shoulders... they've worked so hard today... let them melt away from your ears... down into the bed... Your arms... heavy and loose... your hands... uncurling... fingers relaxing completely...

**Finishing with your head and neck** (6-8 minutes)
Your neck... supporting your head all day... let it rest now... Your jaw... often tight from stress... let it drop open slightly... Your eyes... tired from seeing... let the muscles around them soften...

Your forehead... smooth and peaceful... Your scalp... releasing any remaining tension... Your entire body is now deeply relaxed... completely at peace...

**Peaceful Meadow Visualization (8-12 minutes)**
Imagine you're lying in a peaceful meadow under a canopy of stars... The soft grass beneath you is like nature's own mattress... perfectly supporting your body...

Above you, thousands of gentle stars twinkle in the dark blue sky... Each star is like a peaceful thought... a blessing... a wish for your restful sleep...

A gentle, warm breeze flows over you... carrying away any remaining thoughts from the day... any worries about tomorrow... There is only this moment... this peace... this perfect rest...

**Sleep Affirmations (12-14 minutes)**
As your body rests completely, repeat these gentle words in your mind:
"I am safe and protected as I sleep..."
"My body knows how to heal and restore itself..."
"I release this day with gratitude..."
"I welcome peaceful dreams..."
"I trust in tomorrow's possibilities..."

**Drifting Into Sleep (14-15 minutes)**
Your breathing is now slow and natural... your body completely relaxed... your mind peaceful and quiet...

You are safe... you are loved... you are ready for deep, restorative sleep...

Let yourself drift now... like a leaf floating on calm water... into the healing embrace of sleep... Sweet dreams...`,
        category: "sleep",
        tags: ["sleep", "body-scan", "relaxation"]
      },
      {
        title: "Focus Enhancement Meditation", 
        duration: "5-8 minutes",
        script: `🎯 **FOCUS ENHANCEMENT MEDITATION** 🎯

**Establishing Your Posture (0-1 minute)**
This meditation will sharpen your focus and concentration... Sit tall with your spine straight but not rigid... imagine a string gently pulling the crown of your head toward the sky...

Place your feet flat on the floor, feeling grounded and stable... Rest your hands comfortably on your thighs... Close your eyes and take a moment to arrive fully in this practice...

**Counting Breath Foundation (1-2 minutes)**
Begin by taking five deep, conscious breaths... counting each one as you exhale:

Inhale deeply... Exhale: "One"
Inhale again... Exhale: "Two" 
Inhale... Exhale: "Three"
Inhale... Exhale: "Four"
Inhale... Exhale: "Five"

Feel your mind beginning to settle and focus...

**Breath Awareness Training (2-5 minutes)**
Now, focus your complete attention on your natural breathing... Notice the sensation of cool air entering your nostrils on the inhale... and the warm air leaving on the exhale...

Feel the subtle pause between breaths... the gentle rhythm of your life force... This is your anchor... your point of focus...

When your mind wanders to other thoughts - and it will, this is completely normal - simply notice where it went... Was it planning? Remembering? Worrying? 

Without judgment, gently guide your attention back to your breath... Think of this like training a beloved puppy - be patient, kind, and persistent...

**Strengthening Concentration (5-7 minutes)**
Each time you notice your mind has wandered and return to your breath, you're doing a "mental push-up"... You're literally strengthening your focus muscle... your ability to direct attention where you choose...

Continue for several more breaths... feeling your concentration becoming clearer... sharper... more stable...

Your mind is becoming like still water... clear and undisturbed... able to reflect reality perfectly... When thoughts arise, they're just ripples on the surface... temporary disturbances that settle naturally...

**Affirmations for Clarity (7-8 minutes)**
As you maintain this focused attention, silently repeat:
"My mind is clear and sharp..."
"I can focus on what matters most..."
"I direct my attention with intention..."
"I am present and fully engaged..."
"My concentration grows stronger each day..."

**Integration and Closing (8 minutes)**
Take three more conscious breaths, appreciating this state of mental clarity you've cultivated...

This focused awareness is always available to you... in your studies, your work, your relationships... any time you need it...

When you're ready, slowly open your eyes... carrying this enhanced focus and mental clarity into your day... Notice how alert and present you feel... This is your natural state of focused awareness.`,
        category: "focus",
        tags: ["focus", "concentration", "clarity"]
      },
      {
        title: "Self-Compassion Meditation",
        duration: "8-12 minutes",
        script: `💖 **SELF-COMPASSION MEDITATION** 💖

**Heart Connection (0-1 minute)**
This meditation will help you cultivate deep kindness toward yourself... Sit comfortably and close your eyes... Place both hands on your heart and feel its gentle, steady beating...

This heart of yours has carried you through every single moment of your life... through joy and sorrow, triumph and challenge... It deserves your appreciation and love...

**Cultivating Compassion for Others (1-3 minutes)**
Take a deep breath and bring to mind someone you care about deeply... perhaps a close friend, family member, or even a beloved pet...

Notice how naturally compassion arises for them... Feel that warm, caring energy in your chest... the genuine wish for their happiness and well-being... 

This loving energy might feel like warmth, softness, or a gentle opening in your heart... Remember this feeling - this is the same compassion you deserve to give yourself...

**Extending Compassion to Yourself (3-6 minutes)**
Now, imagine extending that same loving kindness to yourself... Place your hands on your heart again and speak to yourself as you would to that dear friend...

Repeat these healing phrases, allowing them to sink deeply into your heart:

"May I be happy and peaceful..."
"May I be healthy and strong..."
"May I be safe and protected..."
"May I be kind and gentle with myself..."
"May I accept myself exactly as I am..."

Feel these wishes for yourself... you deserve every bit of love and kindness you would give to others...

**Acknowledging Your Struggles (6-8 minutes)**
If you're going through a difficult time right now, acknowledge that suffering is part of the shared human experience... You're not alone in your struggles...

Place your hand on your heart and breathe compassion into any areas of pain or difficulty... Say to yourself:

"This is a moment of suffering..."
"Suffering is part of life..."
"May I be kind to myself in this moment..."
"May I give myself the compassion I need..."

**Affirmations of Self-Worth (8-10 minutes)**
Continue breathing into your heart space as you repeat these powerful truths:

"I am worthy of love, just as I am..."
"I am enough, in this moment, exactly as I am..."
"I forgive myself for my mistakes..."
"I celebrate my efforts and progress..."
"I am gentle with myself during difficult times..."
"I speak to myself with kindness..."
"I honor both my strengths and my vulnerabilities..."

**Embracing Your Wholeness (10-12 minutes)**
Feel this loving-kindness surrounding you like a warm, protective embrace... This compassion is not something you have to earn - it's your birthright... It's always available to you...

Imagine this self-compassion growing stronger each day... becoming your default way of treating yourself... replacing self-criticism with self-kindness... replacing harsh judgment with gentle understanding...

**Gentle Closing**
Take three more deep breaths, feeling grateful for this time you've given yourself... for this practice of self-love...

When you open your eyes, carry this compassion with you... Remember that you can return to your heart, to this loving kindness, whenever you need it...

You are worthy of your own love and compassion... Always.`,
        category: "self-compassion", 
        tags: ["self-compassion", "loving-kindness", "self-care"]
      },
      {
        title: "Family Pressure Relief",
        duration: "6-10 minutes",
        script: `👨‍👩‍👧‍👦 **FAMILY PRESSURE RELIEF MEDITATION** 👨‍👩‍👧‍👦

**Finding Your Safe Space (0-1 minute)**
This meditation is for you when you're feeling overwhelmed by family expectations... Find a quiet space where you feel completely safe and private... This is your time, your space, your healing...

Sit comfortably and take several deep, cleansing breaths... Let each exhale release any tension you're carrying from family dynamics...

**Acknowledging the Challenge (1-2 minutes)**
Acknowledge that it's completely natural to want to make your family proud while also honoring your own authentic path... This is one of the most challenging aspects of growing up, especially in our culture where family bonds are so deep and meaningful...

There's nothing wrong with you for feeling this tension... It shows your love for your family and your integrity to yourself...

**Grounding in Your Authentic Self (2-4 minutes)**
Place one hand on your heart and one on your belly... Feel your own life force... your own breath... your own heartbeat... This is YOU - unique, valuable, and worthy of respect...

Breathe deeply and say to yourself: "I can love my family deeply and still honor my own needs and dreams..."

Imagine yourself surrounded by a warm, protective golden light... This light represents your authentic self - your dreams, your values, your unique gifts and perspectives... It's beautiful, it's valuable, and it deserves to shine...

**Understanding Family Love (4-6 minutes)**
Feel this golden light growing stronger with each breath... Now, think about your family's expectations... Try to see them through the lens of love rather than pressure...

Often, when families have high expectations, it comes from:
- Their love and desire to see you succeed
- Their own fears about your future security
- Cultural traditions that have guided generations
- Their limited understanding of new possibilities

You can appreciate their care and concern while also trusting your own inner wisdom...

**Finding Balance and Harmony (6-8 minutes)**
Repeat these balancing affirmations:

"I respect my family's wisdom AND I trust my own inner knowing..."
"I can honor my heritage while also creating my own path..."
"Love doesn't require me to sacrifice my authentic self..."
"I can be grateful for my family's care while setting healthy boundaries..."
"I am capable of making decisions that honor both family and self..."

**Visualization of Harmony (8-10 minutes)**
Imagine a beautiful scene where you're with your family, and everyone is happy and at peace... In this vision, you've found a way to pursue your dreams while maintaining loving family relationships...

Your family sees and appreciates your authentic self... They understand that your happiness and fulfillment ultimately serve the family's well-being too...

Feel the possibility of this harmony... It may take time, patience, and gentle communication, but it's possible...

**Closing with Strength and Love**
Feel yourself becoming more grounded in your own truth... more confident in your ability to navigate these relationships with love, respect, and integrity...

You have the strength to honor both your family bonds and your personal authenticity... You can create harmony between tradition and innovation, between family loyalty and self-respect...

Take three more deep breaths... When you open your eyes, carry this balance with you... You are loved, you are capable, and you can find your way.`,
        category: "family-pressure",
        tags: ["family-pressure", "boundaries", "understanding"]
      },
      {
        title: "Exam Anxiety Support",
        duration: "5-8 minutes",
        script: `📚 **EXAM ANXIETY SUPPORT MEDITATION** 📚

**Grounding and Validation (0-1 minute)**
This meditation will help calm your mind and heart before exams... Sit comfortably and close your eyes... Take three deep breaths, releasing any tension with each exhale...

First, acknowledge that feeling nervous before exams is completely normal and even healthy... It shows you care about doing well... It shows your commitment to your education and future...

**Physical Grounding (1-2 minutes)**
Place your hands on your thighs and feel the solid support beneath you... Feel your feet connected to the floor... Notice the weight of your body in the chair...

You are safe... You are supported... This anxiety is temporary, but your capability and worth are constant...

**Calming the Mental Storm (2-4 minutes)**
Now imagine your mind as a clear, still lake... Any anxious thoughts about the exam are like ripples on the surface of this lake... temporary disturbances that naturally settle...

With each breath, the water becomes calmer... more still... more peaceful... The lake represents your true nature - calm, clear, and capable of reflecting knowledge perfectly...

Breathe into this stillness... Your mind is naturally clear and focused... Anxiety is just a temporary weather pattern passing through...

**Visualization of Success (4-6 minutes)**
Now, visualize yourself on the day of your exam... See yourself waking up feeling calm and prepared... getting ready with confidence... arriving at the exam location feeling peaceful and focused...

See yourself sitting down for the exam... reading the first question clearly and calmly... feeling your mind easily accessing everything you've studied... Your knowledge is there... organized and available to you...

Visualize yourself working through the exam with steady focus... breathing calmly throughout... feeling confident in your preparation and ability...

**Affirmations of Capability (6-7 minutes)**
As you maintain this calm visualization, repeat these powerful truths:

"I am prepared and ready..."
"I have studied diligently and my efforts will show..."
"I trust in my knowledge and abilities..."
"I remain calm and focused under pressure..."
"I do my best and that is always enough..."
"My worth is not determined by any single exam..."
"I am capable of handling whatever comes..."
"I breathe calmly and think clearly..."

**Support and Perspective (7-8 minutes)**
Imagine a wise, loving presence beside you - perhaps a mentor, family member, or your own inner wisdom - this presence reminds you:

"You are so much more than any test score..."
"You have unique gifts that no exam can measure..."
"Your efforts and growth matter more than perfect results..."
"You are loved and valuable regardless of outcomes..."
"This exam is just one step in your journey, not your destination..."

**Closing with Confidence**
Take three more deep breaths, feeling confident, prepared, and peaceful... This calm confidence is yours to keep and access whenever you need it...

When you open your eyes, carry this peace with you into your studies and into your exam... Remember: You are prepared, you are capable, you are supported, and you will do beautifully.

Trust yourself - you've got this! 🌟`,
        category: "exam-anxiety",
        tags: ["exam-anxiety", "confidence", "calm"]
      }
    ];
  };

  const getMeditationScript = (type: string) => {
    return {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Meditation`,
      duration: "5 minutes",
      script: "Click 'Generate AI Script' to create a personalized meditation for this category.",
      category: type.toLowerCase(),
      tags: [type.toLowerCase(), 'ai-enhanced']
    };
  };

  // Enhanced function to generate meditation scripts for available meditations
  const generateMeditationForAvailable = async (meditation: any): Promise<MeditationScript> => {
    setIsLoading(true);
    
    try {
      const ai = await initializeAI();
      
      if (!ai) {
        return {
          ...meditation,
          script: getFallbackMeditation(meditation.category, 8).script,
          tags: [...(meditation.tags || []), 'enhanced']
        };
      }

      // Parse duration to get a number for script generation
      const durationMatch = meditation.duration.match(/(\d+)/);
      const targetDuration = durationMatch ? parseInt(durationMatch[1]) : 8;

      const completion = await ai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are Dr. Priya, an experienced meditation guide specializing in helping Indian youth navigate stress, anxiety, academic pressure, and family expectations. Create deeply calming, comprehensive guided meditation scripts that feel personal and supportive." 
          },
          { 
            role: "user", 
            content: `Create a comprehensive guided meditation script for "${meditation.title}" in the category "${meditation.category}" lasting approximately ${targetDuration} minutes.

This meditation should:
- Start with gentle grounding and breathing instructions
- Include progressive relaxation techniques
- Add meaningful visualizations relevant to Indian cultural context
- Address the specific challenges of "${meditation.category}"
- Use warm, compassionate language that feels like a caring friend guiding them
- Include elements of self-compassion and positive affirmations
- Have natural pauses indicated by "..."
- End with a gentle transition back to full awareness
- Feel deeply supportive and healing

Make this meditation script comprehensive and deeply calming, as if you're personally guiding someone through their healing journey.

Script:` 
          }
        ],
        max_tokens: 700,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      setIsLoading(false);
      
      if (!response.trim()) {
        return {
          ...meditation,
          script: getFallbackMeditation(meditation.category, targetDuration).script,
          tags: [...(meditation.tags || []), 'enhanced']
        };
      }
      
      return {
        ...meditation,
        script: response.replace(/^Script:\s*/i, '').trim(),
        tags: [...(meditation.tags || []), 'ai-enhanced', 'comprehensive']
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      setIsLoading(false);
      return {
        ...meditation,
        script: getFallbackMeditation(meditation.category, 8).script,
        tags: [...(meditation.tags || []), 'enhanced']
      };
    }
  };
  return {
    isLoading,
    error,
    getTherapistResponse,
    getTherapyInsights,
    getMythBusterResponse,
    getRandomAffirmation,
    getPersonalizedAffirmation,
    generateMeditationScript,
    getMeditationScript,
    getAllMeditations,
    generateMeditationForAvailable,
    getStigmaSupport,
    textToSpeech,
    speechToText,
    // Therapy session management
    therapySessions,
    updateTherapySession,
    categories: MEDITATION_CATEGORIES,
  };
};