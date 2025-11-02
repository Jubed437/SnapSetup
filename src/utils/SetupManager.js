import DependencyInstaller from './DependencyInstaller';

class SetupManager {
  constructor(projectPath, context) {
    this.projectPath = projectPath;
    this.context = context;
    this.retryCount = 2;
    this.retryDelay = 2000;
    // detect whether to run commands in system terminal from context settings
    this.useSystemTerminal = context?.settings?.useSystemTerminal || false;
    this.shellType = context?.settings?.defaultShell || 'powershell';
  }

  // Run full setup process
  async runFullSetup() {
    try {
      // Step 1: System checks
      const systemChecks = await this.runSystemChecks();
      
      if (!systemChecks.node) {
        throw new Error('Node.js is not installed. Please install Node.js from https://nodejs.org/');
      }

      // Step 2: Check .env
      await this.checkEnvFile();

      // Step 3: Check for Docker Compose
      const hasDockerCompose = await window.electronAPI.fileExists(
        `${this.projectPath}/docker-compose.yml`
      );

      if (hasDockerCompose && systemChecks.docker) {
        // Run with Docker
        return await this.runWithDocker();
      } else {
        // Run normal setup
        return await this.runNormalSetup();
      }
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  }

  // Run system checks
  async runSystemChecks() {
    const checks = {
      node: null,
      npm: null,
      docker: null,
    };

    // Check Node
    const nodeCheck = await window.electronAPI.checkCommand('node');
    if (nodeCheck.exists) {
      const nodeVersionResult = await window.electronAPI.runCommand(
        'node',
        ['-v'],
        this.projectPath,
        'node-version-check'
      );
      checks.node = nodeCheck.output.trim();
    } else {
      checks.node = false;
    }

    // Check npm
    const npmCheck = await window.electronAPI.checkCommand('npm');
    if (npmCheck.exists) {
      checks.npm = npmCheck.output.trim();
    } else {
      checks.npm = false;
    }

    // Check Docker
    const dockerCheck = await window.electronAPI.checkCommand('docker');
    if (dockerCheck.exists) {
      const dockerComposeCheck = await window.electronAPI.checkCommand('docker-compose');
      checks.docker = dockerCheck.exists || dockerComposeCheck.exists;
    } else {
      checks.docker = false;
    }

    return checks;
  }

  // Check .env file
  async checkEnvFile() {
    const envExists = await window.electronAPI.fileExists(
      `${this.projectPath}/.env`
    );
    const envExampleExists = await window.electronAPI.fileExists(
      `${this.projectPath}/.env.example`
    );

    if (!envExists && envExampleExists) {
      // Read .env.example and create .env with placeholders
      const envExampleResult = await window.electronAPI.readFile(
        `${this.projectPath}/.env.example`
      );
      
      if (envExampleResult.success) {
        const placeholderContent = this.generateEnvPlaceholders(envExampleResult.content);
        await window.electronAPI.writeFile(
          `${this.projectPath}/.env`,
          placeholderContent
        );
        return { created: true, fromExample: true };
      }
    } else if (!envExists && !envExampleExists) {
      // Create minimal .env
      await window.electronAPI.writeFile(
        `${this.projectPath}/.env`,
        '# Environment variables\n# Add your configuration here\n'
      );
      return { created: true, fromExample: false };
    }

    return { created: false };
  }

  // Generate env placeholders
  generateEnvPlaceholders(envExampleContent) {
    const lines = envExampleContent.split('\n');
    const placeholderLines = lines.map((line) => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || line.trim() === '') {
        return line;
      }

      // Replace values with placeholders
      const [key, ...valueParts] = line.split('=');
      if (key) {
        return `${key}=PLACEHOLDER_${key.trim()}`;
      }
      return line;
    });

    return placeholderLines.join('\n');
  }

  // Run normal setup (npm install)
  async runNormalSetup() {
    // Check for package-lock.json
    const hasLockFile = await window.electronAPI.fileExists(
      `${this.projectPath}/package-lock.json`
    );

    if (this.context) {
      this.context.setSetupStatus('installing');
    }

    // Use npm ci for faster install if lockfile exists
    if (hasLockFile) {
      const installer = new DependencyInstaller(this.projectPath, null, this.useSystemTerminal, this.shellType);
      const result = await installer.installWithCI();
      
      if (!result.success) {
        // Fallback to regular install
        const fallbackResult = await installer.installWithInstall();
        if (!fallbackResult.success) {
          throw new Error('Failed to install dependencies');
        }
      }
    } else {
      // Install with progress tracking if we have dependencies list
      if (this.context && this.context.dependencies && this.context.dependencies.length > 0) {
        await this.installDependenciesWithProgress();
      } else {
        // Fallback to simple npm install
        const installer = new DependencyInstaller(this.projectPath, null, this.useSystemTerminal, this.shellType);
        const result = await installer.installWithInstall();
        if (!result.success) {
          throw new Error('Failed to install dependencies');
        }
      }
    }

    if (this.context) {
      this.context.setSetupStatus('running');
    }

    // After installation, try to start the project
    await this.startProject();

    return { success: true };
  }

  // Install dependencies with progress tracking
  async installDependenciesWithProgress() {
    const installer = new DependencyInstaller(this.projectPath, (progress) => {
      if (!this.context) return;

      switch (progress.type) {
        case 'installing':
          this.context.updateDependencyStatus(progress.package, 'installing');
          this.context.addLog({
            type: 'info',
            message: `Installing ${progress.package} (${progress.current}/${progress.total})`,
          });
          break;
        case 'installed':
          this.context.updateDependencyStatus(progress.package, 'installed');
          this.context.addLog({
            type: 'success',
            message: `✓ Installed ${progress.package}`,
          });
          break;
        case 'failed':
          this.context.updateDependencyStatus(progress.package, 'failed', progress.error);
          this.context.addLog({
            type: 'error',
            message: `✗ Failed to install ${progress.package}: ${progress.error}`,
          });
          break;
      }
    });

  const result = await installer.installDependencies(this.context.dependencies);
    
    if (result.failed > 0) {
      this.context.showToast(
        `Installation completed with ${result.failed} failures`,
        'warning'
      );
    }

    return result;
  }

  // Start project
  async startProject() {
    // Read package.json to find start script
    const pkgResult = await window.electronAPI.readFile(
      `${this.projectPath}/package.json`
    );

    if (!pkgResult.success) {
      throw new Error('Cannot read package.json');
    }

    const packageJson = JSON.parse(pkgResult.content);
    const scripts = packageJson.scripts || {};

    // Prefer dev script, fallback to start
    let scriptName = 'dev';
    if (!scripts.dev && scripts.start) {
      scriptName = 'start';
    } else if (!scripts.dev && !scripts.start) {
      throw new Error('No start/dev script found in package.json');
    }

    // Run the script. For long-running start, spawn a non-blocking process so UI can continue.
    if (this.useSystemTerminal) {
      await window.electronAPI.runInTerminal(`npm run ${scriptName}`, this.projectPath, this.shellType);
    } else {
      // spawn so it doesn't block (we still receive streaming output via IPC)
      const spawnRes = await window.electronAPI.spawnCommand('npm', ['run', scriptName], this.projectPath, `npm-start-${Date.now()}`);
      if (spawnRes && spawnRes.success) {
        // store process id in context for later control
        if (this.context && this.context.setRunningProcessId) {
          this.context.setRunningProcessId(spawnRes.id || spawnRes.pid);
        }
      }
    }

    // After starting, try to detect known frontend ports and confirm server availability
    try {
      const ports = (this.context && this.context.analysis && this.context.analysis.ports) || [];
      for (const p of ports) {
        const url = `http://localhost:${p}`;
        const ok = await this.waitForUrl(url, 15000);
        if (ok) {
          if (this.context && this.context.setRunningServers) {
            this.context.setRunningServers((prev) => ({ ...prev, frontend: url }));
          }
          break;
        }
      }
    } catch (err) {
      // ignore
    }

    return { success: true, script: scriptName };
  }

  // Run with Docker
  async runWithDocker() {
    if (this.useSystemTerminal) {
      await window.electronAPI.runInTerminal('docker-compose up', this.projectPath, this.shellType);
      return { success: true, mode: 'docker' };
    }

    const result = await window.electronAPI.runCommand(
      'docker-compose',
      ['up'],
      this.projectPath,
      'docker-compose-up'
    );

    if (!result.success) {
      // Try with 'docker compose' (newer Docker Desktop)
      const result2 = await window.electronAPI.runCommand(
        'docker',
        ['compose', 'up'],
        this.projectPath,
        'docker-compose-up-v2'
      );

      if (!result2.success) {
        throw new Error('Failed to run docker-compose');
      }
    }

    return { success: true, mode: 'docker' };
  }

  // Generate docker-compose.yml
  async generateDockerCompose() {
    // Read package.json to analyze the project
    const pkgResult = await window.electronAPI.readFile(
      `${this.projectPath}/package.json`
    );

    if (!pkgResult.success) {
      throw new Error('Cannot read package.json');
    }

    const packageJson = JSON.parse(pkgResult.content);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Detect project type and generate appropriate compose file
    let composeContent = 'version: \'3.8\'\n\nservices:\n';

    // Backend service
    if (deps.express || deps.fastify || deps.koa) {
      composeContent += `  backend:
    image: node:18
    working_dir: /usr/src/app
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
    command: sh -c "npm install && npm run dev"
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
    depends_on:`;

      // Add DB dependency if needed
      if (deps.mongodb || deps.mongoose) {
        composeContent += '\n      - mongo';
      } else if (deps.pg) {
        composeContent += '\n      - postgres';
      } else if (deps.mysql || deps.mysql2) {
        composeContent += '\n      - mysql';
      }
      composeContent += '\n\n';
    }

    // Frontend service
    if (deps.react || deps['react-dom'] || deps.next || deps.vite) {
      const port = deps.next ? '3000' : deps.vite ? '5173' : '3000';
      composeContent += `  frontend:
    image: node:18
    working_dir: /usr/src/app
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
    command: sh -c "npm install && npm run dev"
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=development
\n`;
    }

    // Database services
    if (deps.mongodb || deps.mongoose) {
      composeContent += `  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
\n`;
    }

    if (deps.pg) {
      composeContent += `  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
\n`;
    }

    if (deps.mysql || deps.mysql2) {
      composeContent += `  mysql:
    image: mysql:8
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=mydb
\n`;
    }

    // Add volumes section
    composeContent += '\nvolumes:\n';
    if (deps.mongodb || deps.mongoose) composeContent += '  mongo_data:\n';
    if (deps.pg) composeContent += '  postgres_data:\n';
    if (deps.mysql || deps.mysql2) composeContent += '  mysql_data:\n';

    return {
      success: true,
      content: composeContent,
    };
  }

  // Wait for a URL to respond (simple fetch retry)
  async waitForUrl(url, timeoutMs = 15000) {
    const start = Date.now();
    const tryOnce = async () => {
      try {
        const resp = await fetch(url, { method: 'GET' });
        return resp.ok;
      } catch (err) {
        return false;
      }
    };

    while (Date.now() - start < timeoutMs) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await tryOnce();
      if (ok) return true;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
  }

  // Install single package with retry
  async installPackage(packageName, retries = this.retryCount) {
    try {
      if (this.useSystemTerminal) {
        await window.electronAPI.runInTerminal(`npm install ${packageName}`, this.projectPath, this.shellType);
        return { success: true };
      }

      const result = await window.electronAPI.runCommand(
        'npm',
        ['install', packageName],
        this.projectPath,
        `install-${packageName}`
      );

      if (!result.success && retries > 0) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return await this.installPackage(packageName, retries - 1);
      }

      return result;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return await this.installPackage(packageName, retries - 1);
      }
      throw error;
    }
  }
}

export default SetupManager;
