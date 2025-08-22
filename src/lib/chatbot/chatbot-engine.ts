/**
 * AI-Powered Chatbot Engine for Drywall Business Lead Qualification
 * Handles 24/7 customer inquiries and qualifies leads automatically
 */

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LeadQualificationData {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  urgency?: string;
  timeline?: string;
  budget?: string;
  location?: string;
  qualificationScore: number;
  readyForQuote: boolean;
  appointmentRequested?: boolean;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  leadData: LeadQualificationData;
  currentFlow: string;
  isActive: boolean;
  startedAt: Date;
  lastActivity: Date;
}

/**
 * Conversation flows for different scenarios
 */
export const CONVERSATION_FLOWS = {
  GREETING: 'greeting',
  PROJECT_INQUIRY: 'project_inquiry',
  PRICING_QUESTION: 'pricing_question',
  EMERGENCY_REPAIR: 'emergency_repair',
  APPOINTMENT_BOOKING: 'appointment_booking',
  QUALIFICATION: 'qualification',
  HANDOFF_TO_HUMAN: 'handoff_to_human'
};

/**
 * Predefined responses for common drywall business scenarios
 */
export const BOT_RESPONSES = {
  greeting: [
    "Hi! I'm the Curl Feather assistant. I'm here to help with your drywall project! 👋",
    "What can I help you with today?",
    "• Get a free quote",
    "• Ask about our services", 
    "• Schedule a consultation",
    "• Emergency repair info"
  ],

  services_overview: [
    "We specialize in professional drywall services in Bozeman, MT:",
    "🔨 **Drywall Installation** - New construction & renovations",
    "🎨 **Taping & Finishing** - Smooth, professional walls",
    "✨ **Texture Application** - Spray, hand trowel, or smooth",
    "🔧 **Repairs & Patches** - Holes, cracks, water damage",
    "",
    "What type of project are you planning?"
  ],

  pricing_inquiry: [
    "I'd love to get you accurate pricing! Our quotes are always free and customized to your specific project.",
    "",
    "For the most accurate estimate, I'll need to know:",
    "• Project type (installation, repair, etc.)",
    "• Room size or area",
    "• Timeline preferences",
    "",
    "Would you like to get a detailed quote now? It takes just 60 seconds! 📋"
  ],

  emergency_repair: [
    "Oh no! Emergency repairs can be stressful. We've got you covered! 🚨",
    "",
    "For urgent repairs (water damage, large holes, etc.):",
    "📞 **Call us directly: (406) 555-0123**",
    "⏰ **Response time: Within 2 hours**",
    "💯 **Available 7 days a week**",
    "",
    "What type of emergency repair do you need?"
  ],

  appointment_request: [
    "Perfect! I'd be happy to help schedule your free consultation! 📅",
    "",
    "Our team can usually visit within 24-48 hours for:",
    "• Project assessment",
    "• Detailed measurements", 
    "• Personalized quote",
    "• Timeline discussion",
    "",
    "What's your preferred day and time?"
  ],

  qualification_questions: {
    project_type: "What type of drywall work do you need? (installation, repair, texture, etc.)",
    timeline: "When would you like to start this project?",
    budget: "Do you have a budget range in mind? (This helps us provide the best options)",
    location: "Where is your project located? (We serve Bozeman + 25 mile radius)",
    urgency: "How urgent is this project? (ASAP, within 2 weeks, within a month, planning ahead)"
  },

  handoff_to_human: [
    "I'd love to connect you with one of our drywall experts! 👨‍💼",
    "",
    "Here are the best ways to reach our team:",
    "📞 **Call: (406) 555-0123** (Fastest response)",
    "📧 **Email: info@curlfeather.com**",
    "📋 **Get instant quote: Use our 60-second quote form**",
    "",
    "We typically respond within 5 minutes during business hours!"
  ],

  out_of_area: [
    "Thanks for your interest! Unfortunately, we currently only serve the Bozeman, MT area (within 25 miles). 📍",
    "",
    "If you're in our service area, I'd love to help!",
    "If not, I recommend finding a local licensed drywall contractor in your area.",
    "",
    "Is your project location within 25 miles of Bozeman?"
  ]
};

/**
 * Lead qualification scoring system
 */
export class LeadQualifier {
  static calculateScore(leadData: LeadQualificationData): number {
    let score = 0;

    // Contact information provided (30 points max)
    if (leadData.name) score += 10;
    if (leadData.email) score += 10;
    if (leadData.phone) score += 10;

    // Project type qualification (25 points max)
    const projectTypes = ['installation', 'repair', 'texture', 'taping'];
    if (leadData.projectType && projectTypes.some(type => 
      leadData.projectType?.toLowerCase().includes(type))) {
      score += 25;
    }

    // Urgency scoring (20 points max)
    if (leadData.urgency) {
      if (leadData.urgency.toLowerCase().includes('asap') || 
          leadData.urgency.toLowerCase().includes('emergency')) {
        score += 20;
      } else if (leadData.urgency.toLowerCase().includes('2 weeks')) {
        score += 15;
      } else if (leadData.urgency.toLowerCase().includes('month')) {
        score += 10;
      }
    }

    // Budget indication (15 points max)
    if (leadData.budget) {
      if (leadData.budget.includes('$') || 
          leadData.budget.toLowerCase().includes('thousand')) {
        score += 15;
      } else if (leadData.budget.toLowerCase().includes('budget')) {
        score += 8;
      }
    }

    // Location verification (10 points max)
    if (leadData.location) {
      const localAreas = ['bozeman', 'belgrade', 'manhattan', 'livingston', 'mt', 'montana'];
      if (localAreas.some(area => 
        leadData.location?.toLowerCase().includes(area))) {
        score += 10;
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  static isQualified(leadData: LeadQualificationData): boolean {
    const score = this.calculateScore(leadData);
    return score >= 50; // Minimum 50 points to be considered qualified
  }

  static isReadyForQuote(leadData: LeadQualificationData): boolean {
    return !!(leadData.name && leadData.email && leadData.projectType);
  }

  static needsHumanHandoff(leadData: LeadQualificationData): boolean {
    return leadData.qualificationScore >= 70 || 
           leadData.urgency?.toLowerCase().includes('emergency') ||
           leadData.appointmentRequested === true;
  }
}

/**
 * Natural language processing for intent detection
 */
export class IntentDetector {
  static detectIntent(message: string): string {
    const text = message.toLowerCase();

    // Emergency/urgent patterns
    if (text.includes('emergency') || text.includes('urgent') || text.includes('asap') || 
        text.includes('water damage') || text.includes('hole') && text.includes('big')) {
      return CONVERSATION_FLOWS.EMERGENCY_REPAIR;
    }

    // Pricing patterns
    if (text.includes('price') || text.includes('cost') || text.includes('quote') || 
        text.includes('estimate') || text.includes('how much')) {
      return CONVERSATION_FLOWS.PRICING_QUESTION;
    }

    // Appointment patterns
    if (text.includes('appointment') || text.includes('schedule') || text.includes('visit') ||
        text.includes('come out') || text.includes('consultation')) {
      return CONVERSATION_FLOWS.APPOINTMENT_BOOKING;
    }

    // Service inquiry patterns
    if (text.includes('drywall') || text.includes('installation') || text.includes('repair') ||
        text.includes('texture') || text.includes('taping') || text.includes('service')) {
      return CONVERSATION_FLOWS.PROJECT_INQUIRY;
    }

    // Human handoff patterns
    if (text.includes('speak to') || text.includes('talk to') || text.includes('human') ||
        text.includes('person') || text.includes('representative')) {
      return CONVERSATION_FLOWS.HANDOFF_TO_HUMAN;
    }

    // Default to greeting flow
    return CONVERSATION_FLOWS.GREETING;
  }

  static extractProjectInfo(message: string): Partial<LeadQualificationData> {
    const text = message.toLowerCase();
    const extracted: Partial<LeadQualificationData> = {};

    // Extract project type
    if (text.includes('installation') || text.includes('install') || text.includes('new')) {
      extracted.projectType = 'installation';
    } else if (text.includes('repair') || text.includes('fix') || text.includes('patch')) {
      extracted.projectType = 'repair';
    } else if (text.includes('texture') || text.includes('texturing')) {
      extracted.projectType = 'texture';
    } else if (text.includes('taping') || text.includes('finishing')) {
      extracted.projectType = 'taping';
    }

    // Extract urgency
    if (text.includes('asap') || text.includes('immediately') || text.includes('urgent')) {
      extracted.urgency = 'ASAP';
    } else if (text.includes('2 weeks') || text.includes('two weeks')) {
      extracted.urgency = 'Within 2 weeks';
    } else if (text.includes('month') || text.includes('30 days')) {
      extracted.urgency = 'Within a month';
    }

    // Extract location indicators
    const locationMatch = text.match(/\b(bozeman|belgrade|manhattan|livingston)\b/);
    if (locationMatch) {
      extracted.location = locationMatch[1];
    }

    return extracted;
  }
}

/**
 * Main chatbot engine
 */
export class ChatbotEngine {
  private sessions: Map<string, ChatSession> = new Map();

  createSession(): ChatSession {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ChatSession = {
      id: sessionId,
      messages: [],
      leadData: {
        qualificationScore: 0,
        readyForQuote: false
      },
      currentFlow: CONVERSATION_FLOWS.GREETING,
      isActive: true,
      startedAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, session);
    
    // Add welcome message
    this.addBotMessage(session, BOT_RESPONSES.greeting.join('\n\n'));
    
    return session;
  }

  processMessage(sessionId: string, userMessage: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message
    this.addUserMessage(session, userMessage);

    // Detect intent and extract information
    const intent = IntentDetector.detectIntent(userMessage);
    const extractedInfo = IntentDetector.extractProjectInfo(userMessage);

    // Update lead data
    Object.assign(session.leadData, extractedInfo);
    session.leadData.qualificationScore = LeadQualifier.calculateScore(session.leadData);
    session.leadData.readyForQuote = LeadQualifier.isReadyForQuote(session.leadData);

    // Generate bot response based on intent
    const botResponse = this.generateResponse(session, intent, userMessage);
    this.addBotMessage(session, botResponse);

    // Update session
    session.currentFlow = intent;
    session.lastActivity = new Date();

    return session.messages.slice(-2); // Return last 2 messages (user + bot)
  }

  private generateResponse(session: ChatSession, intent: string, userMessage: string): string {
    const { leadData } = session;

    switch (intent) {
      case CONVERSATION_FLOWS.EMERGENCY_REPAIR:
        return BOT_RESPONSES.emergency_repair.join('\n\n');

      case CONVERSATION_FLOWS.PRICING_QUESTION:
        if (leadData.readyForQuote) {
          return "Since you've provided your project details, would you like me to direct you to our 60-second quote form for an instant estimate? 📋✨";
        }
        return BOT_RESPONSES.pricing_inquiry.join('\n\n');

      case CONVERSATION_FLOWS.APPOINTMENT_BOOKING:
        session.leadData.appointmentRequested = true;
        return BOT_RESPONSES.appointment_request.join('\n\n');

      case CONVERSATION_FLOWS.PROJECT_INQUIRY:
        return BOT_RESPONSES.services_overview.join('\n\n');

      case CONVERSATION_FLOWS.HANDOFF_TO_HUMAN:
        return BOT_RESPONSES.handoff_to_human.join('\n\n');

      case CONVERSATION_FLOWS.QUALIFICATION:
        return this.generateQualificationQuestion(leadData);

      default:
        return BOT_RESPONSES.greeting.join('\n\n');
    }
  }

  private generateQualificationQuestion(leadData: LeadQualificationData): string {
    if (!leadData.projectType) {
      return BOT_RESPONSES.qualification_questions.project_type;
    }
    if (!leadData.timeline) {
      return BOT_RESPONSES.qualification_questions.timeline;
    }
    if (!leadData.location) {
      return BOT_RESPONSES.qualification_questions.location;
    }
    if (!leadData.budget) {
      return BOT_RESPONSES.qualification_questions.budget;
    }

    // All basic info collected
    return "Perfect! I have all the information I need. Would you like to:\n\n📋 Get an instant detailed quote\n📞 Schedule a free consultation\n💬 Speak with our team directly";
  }

  private addUserMessage(session: ChatSession, content: string): void {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    session.messages.push(message);
  }

  private addBotMessage(session: ChatSession, content: string): void {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: 'bot',
      timestamp: new Date()
    };
    session.messages.push(message);
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  getQualifiedLeads(): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter(session => LeadQualifier.isQualified(session.leadData));
  }

  getLeadsNeedingHandoff(): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter(session => LeadQualifier.needsHumanHandoff(session.leadData));
  }
}

// Export singleton instance
export const chatbotEngine = new ChatbotEngine();