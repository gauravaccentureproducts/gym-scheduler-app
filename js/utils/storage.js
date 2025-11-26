window.StorageUtils = {
  STORAGE_KEY: 'gymWorkouts',
  VERSION_KEY: 'appVersion',
  CURRENT_VERSION: '1.0.0',
  
  // Save workouts to localStorage with error handling
  saveWorkouts(workouts) {
    try {
      const data = JSON.stringify(workouts);
      localStorage.setItem(this.STORAGE_KEY, data);
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        alert('⚠️ Storage is full. Please delete some old workouts.');
        return false;
      }
      console.error('Error saving workouts:', error);
      return false;
    }
  },
  
  // Load workouts from localStorage with error handling
  loadWorkouts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      
      const workouts = JSON.parse(data);
      
      // Validate data structure
      if (!Array.isArray(workouts)) {
        console.error('Invalid workout data structure');
        return [];
      }
      
      return workouts;
    } catch (error) {
      console.error('Error loading workouts:', error);
      // Attempt recovery
      this.backupCorruptedData();
      return [];
    }
  },
  
  // Backup corrupted data for debugging
  backupCorruptedData() {
    try {
      const corruptedData = localStorage.getItem(this.STORAGE_KEY);
      if (corruptedData) {
        localStorage.setItem('gymWorkouts_backup_' + Date.now(), corruptedData);
        console.log('Corrupted data backed up');
      }
    } catch (error) {
      console.error('Could not backup corrupted data:', error);
    }
  },
  
  // Export workouts as JSON file
  exportWorkouts(workouts) {
    try {
      const dataStr = JSON.stringify(workouts, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gym-workouts-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting workouts:', error);
      alert('❌ Failed to export workouts');
      return false;
    }
  },
  
  // Import workouts from JSON file
  async importWorkouts(file) {
    try {
      const text = await file.text();
      const workouts = JSON.parse(text);
      
      if (!Array.isArray(workouts)) {
        throw new Error('Invalid file format');
      }
      
      return workouts;
    } catch (error) {
      console.error('Error importing workouts:', error);
      alert('❌ Failed to import workouts. Please check the file format.');
      return null;
    }
  },
  
  // Check if localStorage is available
  isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // Get storage usage info
  getStorageInfo() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const bytes = new Blob([data || '']).size;
      const kb = (bytes / 1024).toFixed(2);
      return {
        bytes,
        kb,
        itemCount: data ? JSON.parse(data).length : 0
      };
    } catch (error) {
      return { bytes: 0, kb: '0', itemCount: 0 };
    }
  }
};