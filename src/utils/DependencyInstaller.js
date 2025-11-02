class DependencyInstaller {
  constructor(projectPath, onProgress, useSystemTerminal = false, shellType = 'powershell') {
    this.projectPath = projectPath;
    this.onProgress = onProgress;
    this.retryCount = 2;
    this.retryDelay = 2000;
    this.useSystemTerminal = useSystemTerminal;
    this.shellType = shellType;
  }

  // Install all dependencies sequentially with progress tracking
  async installDependencies(dependencies) {
    const results = [];
    let installed = 0;
    let failed = 0;

    for (let i = 0; i < dependencies.length; i++) {
      const dep = dependencies[i];
      
      // Notify progress: installing
      if (this.onProgress) {
        this.onProgress({
          type: 'installing',
          package: dep.name,
          current: i + 1,
          total: dependencies.length,
          percentage: Math.round(((i) / dependencies.length) * 100),
        });
      }

      try {
        const result = await this.installPackage(dep.name);
        
        if (result.success) {
          installed++;
          results.push({ ...dep, status: 'installed', error: null });
          
          if (this.onProgress) {
            this.onProgress({
              type: 'installed',
              package: dep.name,
              current: i + 1,
              total: dependencies.length,
              percentage: Math.round(((i + 1) / dependencies.length) * 100),
            });
          }
        } else {
          failed++;
          results.push({ ...dep, status: 'failed', error: result.error });
          
          if (this.onProgress) {
            this.onProgress({
              type: 'failed',
              package: dep.name,
              error: result.error,
              current: i + 1,
              total: dependencies.length,
              percentage: Math.round(((i + 1) / dependencies.length) * 100),
            });
          }
        }
      } catch (error) {
        failed++;
        results.push({ ...dep, status: 'failed', error: error.message });
        
        if (this.onProgress) {
          this.onProgress({
            type: 'failed',
            package: dep.name,
            error: error.message,
            current: i + 1,
            total: dependencies.length,
            percentage: Math.round(((i + 1) / dependencies.length) * 100),
          });
        }
      }
    }

    return {
      results,
      installed,
      failed,
      total: dependencies.length,
    };
  }

  // Install a single package with retry logic
  async installPackage(packageName, retries = this.retryCount) {
    try {
      if (this.useSystemTerminal) {
        // Fire-and-forget: open system terminal to run the install command
        await window.electronAPI.runInTerminal(`npm install ${packageName} --save`, this.projectPath, this.shellType);
        return { success: true, package: packageName };
      }

      const result = await window.electronAPI.runCommand(
        'npm',
        ['install', packageName, '--save'],
        this.projectPath,
        `install-${packageName}-${Date.now()}`
      );

      // Check if installation was successful
      // npm returns 0 on success
      if (result.code === 0) {
        return { success: true, package: packageName };
      } else {
        // Retry if we have retries left
        if (retries > 0) {
          await this.sleep(this.retryDelay);
          return await this.installPackage(packageName, retries - 1);
        }
        return { success: false, package: packageName, error: 'Installation failed' };
      }
    } catch (error) {
      // Retry on error
      if (retries > 0) {
        await this.sleep(this.retryDelay);
        return await this.installPackage(packageName, retries - 1);
      }
      return { success: false, package: packageName, error: error.message };
    }
  }

  // Install using npm ci (faster, uses lockfile)
  async installWithCI() {
    try {
      if (this.useSystemTerminal) {
        await window.electronAPI.runInTerminal('npm ci', this.projectPath, this.shellType);
        return { success: true, mode: 'ci' };
      }
      const result = await window.electronAPI.runCommand(
        'npm',
        ['ci'],
        this.projectPath,
        'npm-ci'
      );

      return { success: result.code === 0, mode: 'ci' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Install using npm install (standard)
  async installWithInstall() {
    try {
      if (this.useSystemTerminal) {
        await window.electronAPI.runInTerminal('npm install', this.projectPath, this.shellType);
        return { success: true, mode: 'install' };
      }
      const result = await window.electronAPI.runCommand(
        'npm',
        ['install'],
        this.projectPath,
        'npm-install'
      );

      return { success: result.code === 0, mode: 'install' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper to sleep
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default DependencyInstaller;
