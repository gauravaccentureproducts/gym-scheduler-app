const { useState, useEffect } = React;
const { Dumbbell, Plus, Trash2, Calendar, Download, CheckCircle, XCircle, Upload } = window.Icons;

window.GymScheduler = function GymScheduler() {
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [bodyParts, setBodyParts] = useState([{ bodyPart: '', exercises: [''] }]);
  const [minDate, setMinDate] = useState('');
  const [showActuals, setShowActuals] = useState(null);

  useEffect(() => {
    // Set minimum date to today
    setMinDate(window.DateUtils.getTodayString());
    
    // Load saved workouts
    const savedWorkouts = window.StorageUtils.loadWorkouts();
    setWorkouts(savedWorkouts);
    
    // Check for URL action parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowForm(true);
    }
  }, []);

  useEffect(() => {
    // Save workouts whenever they change
    if (workouts.length >= 0) {
      window.StorageUtils.saveWorkouts(workouts);
    }
  }, [workouts]);

  const handleSavePlan = () => {
    const validBodyParts = bodyParts.filter(bp => 
      bp.bodyPart && bp.exercises.some(e => e.trim())
    );

    if (!date) {
      alert('Please select a date');
      return;
    }

    if (validBodyParts.length === 0) {
      alert('Please add at least one body part with exercises');
      return;
    }

    const workoutData = {
      id: Date.now(),
      date,
      bodyParts: validBodyParts.map(bp => ({
        bodyPart: bp.bodyPart,
        exercises: bp.exercises.filter(e => e.trim())
      })),
      actual: null
    };

    const updatedWorkouts = [...workouts, workoutData].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    setWorkouts(updatedWorkouts);
    setDate('');
    setBodyParts([{ bodyPart: '', exercises: [''] }]);
    setShowForm(false);
    
    alert('✅ Workout plan saved successfully!');
  };

  const deleteWorkout = (id) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      setWorkouts(workouts.filter(w => w.id !== id));
      alert('Workout deleted successfully');
    }
  };

  const hasValidPlanData = () => {
    if (!date) return false;
    return bodyParts.some(bp => 
      bp.bodyPart && bp.exercises.some(e => e.trim())
    );
  };

  const addBodyPart = () => {
    setBodyParts([...bodyParts, { bodyPart: '', exercises: [''] }]);
  };

  const removeBodyPart = (index) => {
    if (bodyParts.length > 1) {
      setBodyParts(bodyParts.filter((_, i) => i !== index));
    } else {
      alert('You must have at least one body part');
    }
  };

  const updateBodyPart = (index, value) => {
    const newBodyParts = [...bodyParts];
    newBodyParts[index].bodyPart = value;
    newBodyParts[index].exercises = [''];
    setBodyParts(newBodyParts);
  };

  const addExercise = (bpIndex) => {
    const newBodyParts = [...bodyParts];
    newBodyParts[bpIndex].exercises.push('');
    setBodyParts(newBodyParts);
  };

  const removeExercise = (bpIndex, exIndex) => {
    const newBodyParts = [...bodyParts];
    if (newBodyParts[bpIndex].exercises.length > 1) {
      newBodyParts[bpIndex].exercises = newBodyParts[bpIndex].exercises.filter((_, i) => i !== exIndex);
      setBodyParts(newBodyParts);
    } else {
      alert('You must have at least one exercise');
    }
  };

  const updateExercise = (bpIndex, exIndex, value) => {
    const newBodyParts = [...bodyParts];
    newBodyParts[bpIndex].exercises[exIndex] = value;
    setBodyParts(newBodyParts);
  };

  const handleExportData = () => {
    window.StorageUtils.exportWorkouts(workouts);
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const importedWorkouts = await window.StorageUtils.importWorkouts(file);
    if (importedWorkouts) {
      if (confirm(`Import ${importedWorkouts.length} workouts? This will replace your current data.`)) {
        setWorkouts(importedWorkouts);
        alert('✅ Workouts imported successfully!');
      }
    }
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-black p-4 safe-top">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800 shadow-xl fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Dumbbell />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Gym Scheduler</h1>
            </div>
            
            <div className="w-full space-y-2">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus />
                <span>Add New Workout</span>
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleExportData}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-colors"
                  disabled={workouts.length === 0}
                >
                  <Download />
                  <span>Export</span>
                </button>
                <label className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors">
                  <Upload />
                  <span>Import</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Add Workout Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800 shadow-xl fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Schedule New Workout</h2>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setDate('');
                  setBodyParts([{ bodyPart: '', exercises: [''] }]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close form"
              >
                <XCircle />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="workout-date" className="block text-gray-300 mb-2 text-sm font-semibold">
                  📅 Workout Date
                </label>
                <input 
                  id="workout-date"
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  min={minDate}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {bodyParts.map((bp, bpIndex) => (
                <div key={bpIndex} className="border-2 border-gray-700 rounded-xl p-5 bg-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-white text-lg font-semibold">
                      💪 Body Part {bpIndex + 1}
                    </label>
                    {bodyParts.length > 1 && (
                      <button 
                        onClick={() => removeBodyPart(bpIndex)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        aria-label={`Remove body part ${bpIndex + 1}`}
                      >
                        <Trash2 />
                      </button>
                    )}
                  </div>
                  
                  <select 
                    value={bp.bodyPart} 
                    onChange={(e) => updateBodyPart(bpIndex, e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label={`Select body part ${bpIndex + 1}`}
                  >
                    <option value="">Select Body Part...</option>
                    {Object.keys(window.bodyPartExercises).map(bodyPart => (
                      <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
                    ))}
                  </select>

                  <div className="space-y-3">
                    <label className="block text-gray-400 text-sm font-semibold">
                      Exercises
                    </label>
                    {bp.exercises.map((ex, exIndex) => (
                      <div key={exIndex} className="flex gap-2">
                        <select 
                          value={ex} 
                          onChange={(e) => updateExercise(bpIndex, exIndex, e.target.value)}
                          disabled={!bp.bodyPart}
                          className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          aria-label={`Select exercise ${exIndex + 1} for body part ${bpIndex + 1}`}
                        >
                          <option value="">Select Exercise...</option>
                          {bp.bodyPart && window.bodyPartExercises[bp.bodyPart]?.map(exercise => {
                            const isSelected = bp.exercises.includes(exercise) && bp.exercises[exIndex] !== exercise;
                            return (
                              <option 
                                key={exercise} 
                                value={exercise}
                                disabled={isSelected}
                                style={isSelected ? { color: '#666', backgroundColor: '#333' } : {}}
                              >
                                {exercise}
                              </option>
                            );
                          })}
                        </select>
                        {bp.exercises.length > 1 && (
                          <button 
                            onClick={() => removeExercise(bpIndex, exIndex)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 rounded-lg transition-colors"
                            aria-label={`Remove exercise ${exIndex + 1}`}
                          >
                            <Trash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => addExercise(bpIndex)}
                      disabled={!bp.bodyPart}
                      className="text-blue-400 hover:text-blue-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      + Add Exercise
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={addBodyPart}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                + Add Another Body Part
              </button>

              {hasValidPlanData() && (
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button 
                    onClick={handleSavePlan}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    💾 Save Plan
                  </button>
                  <button 
                    onClick={() => {
                      setShowForm(false);
                      setDate('');
                      setBodyParts([{ bodyPart: '', exercises: [''] }]);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workouts List */}
        <div className="space-y-4 pb-8">
          {workouts.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-12 text-center border border-gray-800 fade-in">
              <div className="flex justify-center mb-4">
                <Dumbbell />
              </div>
              <h3 className="text-xl text-gray-400 mt-4">No workouts scheduled yet</h3>
              <p className="text-gray-500 mt-2">Click "Add New Workout" to get started!</p>
            </div>
          ) : (
            workouts.map(w => (
              <div key={w.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl fade-in">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <Calendar />
                    <div>
                      <span className="text-white font-semibold text-lg block">
                        {window.DateUtils.formatForDisplay(w.date)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        7:00 AM - 8:00 AM
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {w.actual?.went === true && <CheckCircle />}
                    {w.actual?.went === false && <XCircle />}
                    <button 
                      onClick={() => deleteWorkout(w.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Delete workout"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                    📋 Planned Workout
                  </h3>
                  <div className="space-y-3">
                    {w.bodyParts.map((bp, i) => (
                      <div key={i} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                        <p className="text-white font-bold mb-2 text-lg">
                          💪 {bp.bodyPart}
                        </p>
                        <ul className="space-y-1 pl-4">
                          {bp.exercises.map((ex, j) => (
                            <li key={j} className="text-gray-300 text-sm">
                              • {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-5">
                  <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                    ✅ Actual Workout
                  </h3>
                  
                  {!w.actual ? (
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowActuals(w)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        📝 Record Actuals
                      </button>
                    </div>
                  ) : w.actual.went === false ? (
                    <div className="space-y-3">
                      <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-4">
                        <p className="text-red-300 italic text-center">
                          "{window.motivationalQuotes[Math.floor(Math.random() * window.motivationalQuotes.length)]}"
                        </p>
                      </div>
                      <button 
                        onClick={() => window.CalendarUtils.downloadICS(w)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download />
                        Download Calendar File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-3">
                        {w.actual.data?.map((bp, i) => (
                          <div key={i} className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                            <p className="text-white font-bold mb-2">
                              💪 {bp.bodyPart}
                            </p>
                            <div className="space-y-1 pl-4">
                              {bp.exercises.map((ex, j) => (
                                <p key={j} className="text-gray-300 text-sm">
                                  • {ex.exercise} - <span className="text-green-400 font-semibold">{ex.weight === 'NA' ? 'N/A' : ex.weight + ' kg'}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => window.CalendarUtils.downloadICS(w)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download />
                        Download Calendar File (Plan + Actuals)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actuals Modal */}
        {showActuals && (
          <window.ActualsModal 
            workout={showActuals} 
            onClose={() => setShowActuals(null)} 
            onSave={(went, data) => {
              const updatedWorkouts = workouts.map(w => 
                w.id === showActuals.id 
                  ? { ...w, actual: { went, data } } 
                  : w
              );
              setWorkouts(updatedWorkouts);
              
              const updatedWorkout = updatedWorkouts.find(w => w.id === showActuals.id);
              if (updatedWorkout) {
                window.CalendarUtils.downloadICS(updatedWorkout);
              }
              
              setShowActuals(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};