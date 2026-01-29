/**
 * Support Service
 * AI-powered customer support with strict guardrails
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// Business context and allowed topics
const BUSINESS_CONTEXT = `
You are a helpful customer support assistant for "The Backroom" - a WhatsApp-based inventory management system.

ABOUT THE BACKROOM:
- Product: Inventory management via WhatsApp messages
- How it works: Users send WhatsApp messages (text or voice notes) to update inventory
- AI processes natural language and updates PostgreSQL database in real-time
- Features: Voice notes, real-time sync, transaction history, web dashboard, export to CSV
- Pricing: R189/month (or R1,890/year), includes everything, no hidden fees
- Free trial: 14 days, no credit card required
- Team members: Up to 5 included, R30/user/month for additional
- Support: WhatsApp support (24hr response), email support
- Database: PostgreSQL via Supabase, automatic backups
- Phone number: 083 930 0255 (for WhatsApp)

ALLOWED TOPICS:
- Product features and how it works
- Pricing and plans
- Getting started / onboarding
- Technical questions about the system
- Billing and subscriptions
- Account management
- Troubleshooting common issues
- Comparison with competitors

STRICT RULES:
1. ONLY answer questions about The Backroom business
2. NEVER provide personal advice, medical, legal, or financial advice
3. NEVER discuss politics, religion, or controversial topics
4. NEVER share sensitive information or make up data
5. If asked about unrelated topics, politely redirect to business questions
6. If you don't know something, admit it and suggest contacting support
7. Keep responses concise and helpful (2-3 paragraphs max)
8. Always be professional, friendly, and helpful

RESPONSE FORMAT:
- Be conversational and friendly
- Use bullet points for lists
- Include relevant details (pricing, features, etc.)
- End with a helpful next step or question
`;

/**
 * Get AI response for customer support query
 */
async function getChatResponse(userMessage) {
  try {
    // Check if message is appropriate
    if (!isBusinessRelated(userMessage)) {
      return {
        response: "I'm here to help with questions about The Backroom inventory management system. I can answer questions about our features, pricing, how to get started, and more. What would you like to know about The Backroom?",
        isRelevant: false,
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `${BUSINESS_CONTEXT}

USER QUESTION: ${userMessage}

Provide a helpful, concise response (2-3 paragraphs max). If the question is not about The Backroom business, politely redirect them.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    logger.info('Support chat response generated', { 
      userMessage: userMessage.substring(0, 50),
      responseLength: response.length 
    });

    return {
      response: response.trim(),
      isRelevant: true,
    };
  } catch (error) {
    logger.error('Failed to generate support response', { error: error.message });
    throw error;
  }
}

/**
 * Check if message is business-related
 */
function isBusinessRelated(message) {
  const lowerMessage = message.toLowerCase();
  
  // Blocked topics
  const blockedTopics = [
    'politics', 'election', 'government', 'president',
    'religion', 'god', 'bible', 'quran',
    'medical', 'doctor', 'medicine', 'health',
    'legal', 'lawyer', 'law', 'court',
    'personal advice', 'relationship', 'dating',
    'write code', 'hack', 'exploit',
  ];

  for (const topic of blockedTopics) {
    if (lowerMessage.includes(topic)) {
      return false;
    }
  }

  // Business-related keywords
  const businessKeywords = [
    'backroom', 'inventory', 'stock', 'whatsapp',
    'price', 'pricing', 'cost', 'plan', 'subscription',
    'feature', 'how', 'work', 'use', 'setup',
    'voice', 'message', 'database', 'dashboard',
    'trial', 'demo', 'start', 'sign up',
    'team', 'user', 'account', 'support',
  ];

  // If message contains business keywords, it's likely relevant
  for (const keyword of businessKeywords) {
    if (lowerMessage.includes(keyword)) {
      return true;
    }
  }

  // If message is a general greeting or question, allow it
  const greetings = ['hi', 'hello', 'hey', 'help', 'question', 'what', 'how', 'can', 'do'];
  for (const greeting of greetings) {
    if (lowerMessage.includes(greeting)) {
      return true;
    }
  }

  // Default to allowing (AI will handle inappropriate questions)
  return true;
}

module.exports = {
  getChatResponse,
};
