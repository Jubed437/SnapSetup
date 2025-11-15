// Groq API integration
class GroqAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.available = false;
    this.model = 'llama-3.3-70b-versatile'; // Fast and capable
  }

  // Check if API key is available
  async checkAvailability() {
    if (!this.apiKey || this.apiKey === 'your-groq-api-key-here') {
      this.available = false;
      return false;
    }

    try {
      // Quick test call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.available = response.ok;
      return response.ok;
    } catch (error) {
      this.available = false;
      return false;
    }
  }

  // Query Groq API
  async query(prompt, context) {
    if (!this.available) {
      return null;
    }

    try {
      const messages = this.buildMessages(prompt, context);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Groq API returned ${response.status}`);
      }

      const data = await response.json();
      return this.parseResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Groq API query failed:', error);
      return null;
    }
  }

  // Build context-aware messages
  buildMessages(userQuery, context) {
    const systemPrompt = `You are a helpful setup assistant for JavaScript projects. Be concise and actionable. Provide specific commands when possible.`;
    
    const contextParts = [];

    if (context.project) {
      contextParts.push(`Project: ${context.project.name || 'Unknown'}`);
    }

    if (context.analysis) {
      contextParts.push(`Type: ${context.analysis.type}`);
      contextParts.push(`Stack: ${context.analysis.stack.join(', ')}`);
    }

    contextParts.push(`Status: ${context.setupStatus}`);

    if (context.logs && context.logs.length > 0) {
      const recentLogs = context.logs.slice(-3);
      contextParts.push('\nRecent logs:');
      recentLogs.forEach(log => {
        contextParts.push(`- ${log.type}: ${log.message}`);
      });
    }

    const userMessage = contextParts.length > 0
      ? `${contextParts.join('\n')}\n\nUser: ${userQuery}`
      : userQuery;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
  }

  // Parse API response
  parseResponse(response) {
    if (!response) return null;

    // Clean up the response
    const cleaned = response.trim();

    // Try to extract actions if the AI suggests commands
    const actions = [];
    const commandPattern = /`([^`]+)`|npm (install|run|start|build)/g;
    let match;

    while ((match = commandPattern.exec(cleaned)) !== null) {
      const cmd = match[1] || `npm ${match[2]}`;
      actions.push({ type: 'suggestion', text: cmd });
    }

    return {
      message: cleaned,
      actions,
      confidence: 0.8,
    };
  }

  // Get setup instructions
  getSetupInstructions() {
    return {
      message: `AI is powered by Groq API. The developer needs to configure the API key for advanced AI features to work.`,
      actions: [],
      confidence: 1.0,
    };
  }
}

export default GroqAPI;
