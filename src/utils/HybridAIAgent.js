import RuleEngine from './RuleEngine';
import GroqAPI from './GroqAPI';

// Hybrid AI Agent - combines rule-based logic with optional LLM
class HybridAIAgent {
  constructor(projectContext, groqApiKey) {
    this.context = projectContext;
    this.ruleEngine = new RuleEngine(projectContext);
    this.groqAPI = new GroqAPI(groqApiKey);
    this.aiAvailable = false;
    this.initialized = false;
  }

  // Initialize the agent
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.aiAvailable = await this.groqAPI.checkAvailability();
      this.initialized = true;
      
      if (this.aiAvailable) {
        console.log('✅ Groq AI available');
      } else {
        console.log('ℹ️ Groq AI not configured, using rule-based responses only');
      }
    } catch (error) {
      console.error('Failed to initialize AI agent:', error);
      this.aiAvailable = false;
      this.initialized = true;
    }
  }

  // Main chat handler
  async chat(userMessage, currentContext) {
    try {
      // Ensure initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Update context
      const context = currentContext || this.getContext();

      // Step 1: Detect intent using rules
      const { intent, confidence: intentConfidence } = this.ruleEngine.detectIntent(userMessage);

      // Step 2: Try rule-based response first (fast and reliable)
      const ruleResponse = this.ruleEngine.handleIntent(intent, userMessage, context);

      // If high confidence, return rule-based response
      if (ruleResponse.confidence >= 0.8) {
        return {
          ...ruleResponse,
          source: 'rules',
        };
      }

      // Step 3: If low confidence and AI available, try Groq
      if (this.aiAvailable && ruleResponse.confidence < 0.8) {
        const aiResponse = await this.groqAPI.query(userMessage, context);
        
        if (aiResponse) {
          return {
            ...aiResponse,
            source: 'groq',
          };
        }
      }

      // Step 4: Fallback to rule response
      return {
        ...ruleResponse,
        source: 'rules',
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        message: `Sorry, I encountered an error: ${error.message}`,
        actions: [],
        confidence: 0.5,
        source: 'error',
      };
    }
  }

  // Get current context
  getContext() {
    return {
      project: this.context.project,
      projectPath: this.context.projectPath,
      analysis: this.context.analysis,
      dependencies: this.context.dependencies,
      setupStatus: this.context.setupStatus,
      logs: this.context.logs,
      runningServers: this.context.runningServers,
      systemChecks: this.context.systemChecks,
    };
  }

  // Analyze project and suggest setup plan
  async analyzeAndPlan(analysis) {
    const plan = {
      steps: [],
      warnings: [],
      recommendations: [],
    };

    // System checks
    plan.steps.push({
      name: 'System Check',
      description: 'Verify Node.js, npm, and Docker',
      required: true,
    });

    // Environment setup
    if (analysis.hasEnvExample && !analysis.hasEnv) {
      plan.steps.push({
        name: 'Environment Setup',
        description: 'Create .env file from .env.example',
        required: true,
      });
      plan.warnings.push('Remember to update .env with your actual values');
    }

    // Docker setup
    if (analysis.hasDatabase && !analysis.hasDockerCompose) {
      plan.steps.push({
        name: 'Docker Setup',
        description: 'Generate docker-compose.yml for database',
        required: false,
      });
      plan.recommendations.push('Consider using Docker for database management');
    }

    // Dependency installation
    plan.steps.push({
      name: 'Install Dependencies',
      description: 'Run npm install for all packages',
      required: true,
    });

    // Start servers
    if (analysis.type === 'fullstack') {
      plan.steps.push({
        name: 'Start Database',
        description: 'Start database containers',
        required: analysis.hasDatabase,
      });
      plan.steps.push({
        name: 'Start Backend',
        description: 'Start backend server',
        required: true,
      });
      plan.steps.push({
        name: 'Start Frontend',
        description: 'Start frontend dev server',
        required: true,
      });
    } else {
      plan.steps.push({
        name: 'Start Server',
        description: `Start ${analysis.type} server`,
        required: true,
      });
    }

    return plan;
  }

  // Diagnose errors from logs
  diagnoseErrors(logs) {
    const errors = logs.filter(log => log.type === 'error');
    
    if (errors.length === 0) {
      return {
        hasErrors: false,
        message: 'No errors detected',
      };
    }

    const diagnoses = errors.map(error => 
      this.ruleEngine.diagnoseError(error.message)
    );

    return {
      hasErrors: true,
      count: errors.length,
      diagnoses,
    };
  }

  // Get AI status
  getAIStatus() {
    return {
      available: this.aiAvailable,
      model: this.groqAPI.model,
      provider: 'Groq',
      instructions: this.aiAvailable 
        ? 'AI is active and ready' 
        : 'AI not configured - using rule-based responses',
    };
  }

  // Check if AI is available
  isAIAvailable() {
    return this.aiAvailable;
  }

  // Update API key
  updateApiKey(newApiKey) {
    this.groqAPI = new GroqAPI(newApiKey);
    this.initialized = false;
    return this.initialize();
  }
}

export default HybridAIAgent;
