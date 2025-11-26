window.DateUtils = {
  // Get today's date in YYYY-MM-DD format
  getTodayString() {
    const today = new Date();
    return this.formatToYYYYMMDD(today);
  },
  
  // Format date object to YYYY-MM-DD
  formatToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // Parse YYYY-MM-DD to Date object (local timezone)
  parseYYYYMMDD(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  },
  
  // Format date for display (e.g., "Mon, Jan 15, 2024")
  formatForDisplay(dateString) {
    const date = this.parseYYYYMMDD(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  },
  
  // Get full day and date separately
  getFullDayAndDate(dateString) {
    const date = this.parseYYYYMMDD(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[date.getDay()],
      date: `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    };
  },
  
  // Format date for ICS file (YYYYMMDDTHHMMSS)
  formatForICS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  },
  
  // Create workout start time (7:00 AM local)
  createWorkoutStartTime(dateString) {
    const date = this.parseYYYYMMDD(dateString);
    date.setHours(7, 0, 0, 0);
    return date;
  },
  
  // Create workout end time (8:00 AM local)
  createWorkoutEndTime(dateString) {
    const date = this.parseYYYYMMDD(dateString);
    date.setHours(8, 0, 0, 0);
    return date;
  }
};