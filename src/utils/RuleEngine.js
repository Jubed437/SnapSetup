// Rule-based intelligence for project setup
class RuleEngine {
  constructor(projectContext) {
    this.context = projectContext;
  }

  // Detect user intent from query
  detectIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    const patterns = {
      install: /install|dependencies|npm|packages|setup/i,
      start: /start|run|launch|serve|begin/i,
      stop: /stop|kill|terminate|end/i,
      status: /status|progress|what.*happening|how.*going/i,
      error: /error|fail|broken|issue|problem|fix|debug/i,
      configure: /config|setup|change|modify|settings/i,
      docker: /docker|container|compose/i,
      env: /env|environment|variable/i,
      help: /help|how|what.*do|guide/i,
    };

    for (const [intent, regex] of Object.entries(patterns)) {
      if (regex.test(lowerQuery)) {
        return { intent, confidence: 0.9 };
      }
    }

    return { intent: 'unknown', confidence: 0.3 };
  }

  // Handle detected intent
  handleIntent(intent, query, context) {
    try {
      switch (intent) {
        case 'install':
          return this.handleInstall(context);
        case 'start':
          return this.handleStart(context);
        case 'stop':
          return this.handleStop(context);
        case 'status':
          return this.handleStatus(context);
        case 'error':
          return this.handleError(context, query);
        case 'configure':
          return this.handleConfigure(context);
        case 'docker':
          return this.handleDocker(context);
        case 'env':
          return this.handleEnv(context);
        case 'help':
          return this.handleHelp(context);
        default:
          return this.handleUnknown(query);
      }
    } catch (error) {
      return {
        message: `Error processing request: ${error.message}`,
        actions: [],
        confidence: 0.5,
      };
    }
  }

  handleInstall(context) {
    if (!context.project) {
      return {
        message: "Please upload a project first before installing dependencies.",
        actions: [],
        confidence: 1.0,
      };
    }

    if (context.setupStatus === 'installing') {
      return {
        message: "Installation is already in progress. Check the terminal for details.",
        actions: [],
        confidence: 1.0,
      };
    }

    return {
      message: "I'll install all dependencies for you. This may take a few minutes.",
      actions: [{ type: 'start_setup' }],
      confidence: 1.0,
    };
  }

  handleStart(context) {
    if (!context.project) {
      return {
        message: "No project loaded. Please upload a project first.",
        actions: [],
        confidence: 1.0,
      };
    }

    if (context.setupStatus === 'running') {
      const servers = [];
      if (context.runningServers.frontend) servers.push(`Frontend: ${context.runningServers.frontend}`);
      if (context.runningServers.backend) servers.push(`Backend: ${context.runningServers.backend}`);
      
      return {
        message: servers.length > 0 
          ? `Servers are already running:\n${servers.join('\n')}`
          : "Setup is running. Check the terminal for progress.",
        actions: [],
        confidence: 1.0,
      };
    }

    return {
      message: "Starting the setup process...",
      actions: [{ type: 'start_setup' }],
      confidence: 1.0,
    };
  }

  handleStop(context) {
    if (context.setupStatus !== 'running' && context.setupStatus !== 'installing') {
      return {
        message: "No processes are currently running.",
        actions: [],
        confidence: 1.0,
      };
    }

    return {
      message: "To stop running servers, close the terminal or use Ctrl+C in the terminal window.",
      actions: [],
      confidence: 0.8,
    };
  }

  handleStatus(context) {
    if (!context.project) {
      return {
        message: "No project loaded yet. Upload a project to get started.",
        actions: [],
        confidence: 1.0,
      };
    }

    const status = [];
    status.push(`📦 Project: ${context.project.name || 'Unknown'}`);
    status.push(`📊 Status: ${context.setupStatus}`);
    
    if (context.analysis) {
      status.push(`🔧 Type: ${context.analysis.type}`);
      status.push(`📚 Stack: ${context.analysis.stack.join(', ')}`);
    }

    if (context.dependencies.length > 0) {
      const installed = context.dependencies.filter(d => d.status === 'installed').length;
      const failed = context.dependencies.filter(d => d.status === 'failed').length;
      status.push(`📦 Dependencies: ${installed}/${context.dependencies.length} installed${failed > 0 ? `, ${failed} failed` : ''}`);
    }

    if (context.runningServers.frontend || context.runningServers.backend) {
      status.push(`\n🚀 Running Servers:`);
      if (context.runningServers.frontend) status.push(`   Frontend: ${context.runningServers.frontend}`);
      if (context.runningServers.backend) status.push(`   Backend: ${context.runningServers.backend}`);
    }

    return {
      message: status.join('\n'),
      actions: [],
      confidence: 1.0,
    };
  }

  handleError(context, query) {
    const recentLogs = context.logs.slice(-10);
    const errors = recentLogs.filter(log => log.type === 'error');

    if (errors.length === 0) {
      return {
        message: "I don't see any recent errors. If you're experiencing issues, please describe them in detail.",
        actions: [],
        confidence: 0.7,
      };
    }

    // Diagnose the most recent error
    const lastError = errors[errors.length - 1];
    const diagnosis = this.diagnoseError(lastError.message);

    return {
      message: `I found an error: ${diagnosis.issue}\n\n${diagnosis.solution}`,
      actions: diagnosis.actions || [],
      confidence: diagnosis.confidence,
    };
  }

  diagnoseError(errorMessage) {
    const errorPatterns = [
      {
        pattern: /EADDRINUSE.*:(\d+)/i,
        diagnose: (match) => ({
          issue: `Port ${match[1]} is already in use`,
          solution: `Another process is using port ${match[1]}. You can:\n1. Kill the process using that port\n2. Change the port in your configuration`,
          actions: [{ type: 'suggestion', text: `Run: npx kill-port ${match[1]}` }],
          confidence: 0.95,
        }),
      },
      {
        pattern: /Cannot find module ['"](.+)['"]/i,
        diagnose: (match) => ({
          issue: `Missing module: ${match[1]}`,
          solution: `The module "${match[1]}" is not installed. Run npm install to fix this.`,
          actions: [{ type: 'start_setup' }],
          confidence: 0.9,
        }),
      },
      {
        pattern: /ENOENT.*\.env/i,
        diagnose: () => ({
          issue: 'Missing .env file',
          solution: 'Your project needs a .env file. I can create one from .env.example if it exists.',
          actions: [{ type: 'create_env' }],
          confidence: 1.0,
        }),
      },
      {
        pattern: /npm ERR!/i,
        diagnose: () => ({
          issue: 'NPM installation error',
          solution: 'There was an error during npm install. Try:\n1. Delete node_modules and package-lock.json\n2. Run npm install again\n3. Check your internet connection',
          actions: [{ type: 'retry' }],
          confidence: 0.7,
        }),
      },
    ];

    for (const { pattern, diagnose } of errorPatterns) {
      const match = errorMessage.match(pattern);
      if (match) return diagnose(match);
    }

    return {
      issue: 'Unknown error',
      solution: 'I couldn\'t identify the specific error. Check the terminal logs for more details.',
      confidence: 0.3,
    };
  }

  handleConfigure(context) {
    return {
      message: "You can configure settings by clicking the gear icon in the header. Available settings:\n• Theme\n• Default shell\n• AI agent options",
      actions: [],
      confidence: 1.0,
    };
  }

  handleDocker(context) {
    if (!context.analysis) {
      return {
        message: "Please load a project first.",
        actions: [],
        confidence: 1.0,
      };
    }

    if (context.analysis.hasDockerCompose) {
      return {
        message: "Your project already has a docker-compose.yml file. You can start it with: docker-compose up",
        actions: [],
        confidence: 1.0,
      };
    }

    if (context.analysis.hasDatabase) {
      return {
        message: "I can generate a docker-compose.yml file for your database. Would you like me to do that?",
        actions: [{ type: 'generate_docker' }],
        confidence: 0.9,
      };
    }

    return {
      message: "Your project doesn't seem to need Docker. It's typically used for databases and containerized services.",
      actions: [],
      confidence: 0.8,
    };
  }

  handleEnv(context) {
    if (!context.analysis) {
      return {
        message: "Please load a project first.",
        actions: [],
        confidence: 1.0,
      };
    }

    if (context.analysis.hasEnv) {
      return {
        message: "Your project has a .env file. Make sure to update it with your actual configuration values.",
        actions: [],
        confidence: 1.0,
      };
    }

    if (context.analysis.hasEnvExample) {
      return {
        message: "I can create a .env file from your .env.example with placeholder values.",
        actions: [{ type: 'create_env' }],
        confidence: 1.0,
      };
    }

    return {
      message: "Your project doesn't have .env or .env.example files. Environment variables are used for configuration like API keys and database URLs.",
      actions: [],
      confidence: 0.9,
    };
  }

  handleHelp(context) {
    const help = [
      "I can help you with:",
      "• 'install dependencies' - Install all project dependencies",
      "• 'start server' - Start development servers",
      "• 'check status' - See current project status",
      "• 'fix errors' - Diagnose and fix common errors",
      "• 'generate docker-compose' - Create Docker configuration",
      "• 'create .env file' - Set up environment variables",
      "\nJust ask me in natural language!"
    ];

    return {
      message: help.join('\n'),
      actions: [],
      confidence: 1.0,
    };
  }

  handleUnknown(query) {
    return {
      message: "I'm not sure what you're asking. Try:\n• 'install dependencies'\n• 'start server'\n• 'check status'\n• 'help' for more options",
      actions: [],
      confidence: 0.3,
    };
  }
}

export default RuleEngine;
