window.CalendarUtils = {
  // Generate ICS file content
  generateICS(workout) {
    try {
      const startDate = window.DateUtils.createWorkoutStartTime(workout.date);
      const endDate = window.DateUtils.createWorkoutEndTime(workout.date);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      let description = 'PLANNED WORKOUT:\\n\\n';
      workout.bodyParts.forEach(bp => {
        description += `${bp.bodyPart}:\\n`;
        bp.exercises.forEach(ex => {
          description += `- ${ex}\\n`;
        });
        description += '\\n';
      });

      if (workout.actual && workout.actual.went === true && workout.actual.data) {
        description += 'ACTUAL WORKOUT:\\n\\n';
        workout.actual.data.forEach(bp => {
          description += `${bp.bodyPart}:\\n`;
          bp.exercises.forEach(ex => {
            description += `- ${ex.exercise} (${ex.weight === 'NA' ? 'N/A' : ex.weight + 'kg'})\\n`;
          });
          description += '\\n';
        });
      } else if (workout.actual && workout.actual.went === false) {
        description += 'ACTUAL WORKOUT:\\n\\nDid not attend gym on this day.';
      }

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Gym Scheduler App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:${timeZone}
END:VTIMEZONE
BEGIN:VEVENT
UID:${workout.id}@gym-scheduler-app
DTSTAMP:${window.DateUtils.formatForICS(new Date())}
DTSTART;TZID=${timeZone}:${window.DateUtils.formatForICS(startDate)}
DTEND;TZID=${timeZone}:${window.DateUtils.formatForICS(endDate)}
SUMMARY:${workout.bodyParts.map(bp => bp.bodyPart).join(' + ')} Workout
DESCRIPTION:${description.replace(/\n/g, '\\n')}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Workout in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

      return icsContent;
    } catch (error) {
      console.error('Error generating ICS:', error);
      throw error;
    }
  },
  
  // Download ICS file
  async downloadICS(workout) {
    try {
      const icsContent = this.generateICS(workout);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      
      // Check if running on mobile and Web Share API is available
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile && navigator.share && navigator.canShare) {
        const file = new File([blob], `workout-${workout.date}.ics`, { 
          type: 'text/calendar' 
        });
        
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Gym Workout Calendar Event',
              text: `Add ${workout.bodyParts.map(bp => bp.bodyPart).join(' + ')} workout to your calendar`
            });
            return true;
          } catch (shareError) {
            if (shareError.name !== 'AbortError') {
              console.log('Share failed, falling back to download:', shareError);
              this.fallbackDownload(blob, workout.date);
            }
            return false;
          }
        }
      }
      
      // Fallback to direct download
      this.fallbackDownload(blob, workout.date);
      return true;
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Failed to create calendar file. Please try again.');
      return false;
    }
  },
  
  // Fallback download method
  fallbackDownload(blob, date) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gym-workout-${date}.ics`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
};