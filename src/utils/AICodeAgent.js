class AICodeAgent {
  constructor(apiKey, model = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async analyzeCode(filePath, fileContent) {
    const prompt = `Analyze this code and provide suggestions for improvements, bugs, and best practices:\n\nFile: ${filePath}\n\n${fileContent}`;
    
    return await this.callAI(prompt);
  }

  async fixBug(filePath, fileContent, bugDescription) {
    const prompt = `Fix the following bug in this code:\n\nBug: ${bugDescription}\n\nFile: ${filePath}\n\n${fileContent}\n\nProvide the fixed code.`;
    
    return await this.callAI(prompt);
  }

  async addFeature(filePath, fileContent, featureDescription) {
    const prompt = `Add the following feature to this code:\n\nFeature: ${featureDescription}\n\nFile: ${filePath}\n\n${fileContent}\n\nProvide the updated code with the new feature.`;
    
    return await this.callAI(prompt);
  }

  async refactorCode(filePath, fileContent) {
    const prompt = `Refactor this code to improve readability, performance, and maintainability:\n\nFile: ${filePath}\n\n${fileContent}\n\nProvide the refactored code.`;
    
    return await this.callAI(prompt);
  }

  async explainCode(filePath, fileContent) {
    const prompt = `Explain what this code does in simple terms:\n\nFile: ${filePath}\n\n${fileContent}`;
    
    return await this.callAI(prompt);
  }

  async generateTests(filePath, fileContent) {
    const prompt = `Generate unit tests for this code:\n\nFile: ${filePath}\n\n${fileContent}\n\nProvide complete test code.`;
    
    return await this.callAI(prompt);
  }

  async callAI(prompt) {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please add it in Settings.');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert software developer helping with code analysis, bug fixes, and improvements.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`AI request failed: ${error.message}`);
    }
  }
}

export default AICodeAgent;
