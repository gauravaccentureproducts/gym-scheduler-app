const { useState } = React;
const { Trash2, XCircle, Download } = window.Icons;

window.ActualsModal = function ActualsModal({ workout, onClose, onSave }) {
  const [went, setWent] = useState('');
  const [bps, setBps] = useState([{ bodyPart: '', exercises: [{ exercise: '', weight: '', isNA: false }] }]);

  const copyFromPlan = () => {
    const copiedBps = workout.bodyParts.map(bp => ({
      bodyPart: bp.bodyPart,
      exercises: bp.exercises.map(ex => ({ exercise: ex, weight: '', isNA: false }))
    }));
    setBps(copiedBps);
    alert('✅ Plan copied! Now fill in the weights or mark as N/A.');
  };

  const addBodyPart = () => {
    setBps([...bps, { bodyPart: '', exercises: [{ exercise: '', weight: '', isNA: false }] }]);
  };

  const removeBodyPart = (index) => {
    if (bps.length > 1) {
      setBps(bps.filter((_, i) => i !== index));
    }
  };

  const addExercise = (bpIndex) => {
    const newBps = [...bps];
    newBps[bpIndex].exercises.push({ exercise: '', weight: '', isNA: false });
    setBps(newBps);
  };

  const removeExercise = (bpIndex, exIndex) => {
    const newBps = [...bps];
    if (newBps[bpIndex].exercises.length > 1) {
      newBps[bpIndex].exercises = newBps[bpIndex].exercises.filter((_, i) => i !== exIndex);
      setBps(newBps);
    }
  };

  const updateBodyPart = (index, value) => {
    const newBps = [...bps];
    newBps[index].bodyPart = value;
    newBps[index].exercises = [{ exercise: '', weight: '', isNA: false }];
    setBps(newBps);
  };

  const updateExercise = (bpIndex, exIndex, field, value) => {
    const newBps = [...bps];
    if (field === 'isNA') {
      newBps[bpIndex].exercises[exIndex].isNA = value;
      if (value) {
        newBps[bpIndex].exercises[exIndex].weight = '';
      }
    } else {
      newBps[bpIndex].exercises[exIndex][field] = value;
    }
    setBps(newBps);
  };

  const getSelectedExercises = (bpIndex) => {
    return bps[bpIndex].exercises.map(ex => ex.exercise).filter(e => e);
  };

  const handleDownloadCalendar = () => {
    if (!went) {
      alert('Please select if you went to the gym');
      return;
    }

    if (went === 'no') {
      onSave(false, null);
      return;
    }

    let hasInvalidExercise = false;
    let invalidExercises = [];

    bps.forEach(bp => {
      bp.exercises.forEach(ex => {
        if (ex.exercise && !ex.weight && !ex.isNA) {
          hasInvalidExercise = true;
          invalidExercises.push(ex.exercise);
        }
      });
    });

    if (hasInvalidExercise) {
      alert(`❌ Error: Please enter weight (kg) or mark as N/A for all exercises.\n\nMissing weight/N/A for:\n${invalidExercises.join('\n')}`);
      return;
    }

    const validData = bps
      .filter(b => b.bodyPart && b.exercises.some(e => e.exercise && (e.weight || e.isNA)))
      .map(b => ({
        bodyPart: b.bodyPart,
        exercises: b.exercises
          .filter(e => e.exercise && (e.weight || e.isNA))
          .map(e => ({
            exercise: e.exercise,
            weight: e.isNA ? 'NA' : e.weight
          }))
      }));

    if (validData.length === 0) {
      alert('Please add at least one exercise with weight or N/A');
      return;
    }

    onSave(true, validData);
  };

  const { day, date } = window.DateUtils.getFullDayAndDate(workout.date);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full my-8 border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-900 pb-4 border-b border-gray-800 z-10">
          <h2 id="modal-title" className="text-2xl font-bold text-white">Record Actual Workout</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XCircle />
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Workout Date</p>
          <p className="text-white font-semibold text-lg">{day}, {date}</p>
          <p className="text-gray-500 text-xs mt-1">7:00 AM - 8:00 AM</p>
        </div>

        <div className="mb-6">
          <label htmlFor="went-to-gym" className="block text-gray-300 mb-3 text-sm font-semibold">
            Did you go to the gym?
          </label>
          <select 
            id="went-to-gym"
            value={went} 
            onChange={(e) => setWent(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="yes">✅ Yes, I went</option>
            <option value="no">❌ No, I didn't go</option>
          </select>
        </div>

        {went === 'yes' && (
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500 rounded-xl p-5 mb-6">
            <button 
              onClick={copyFromPlan}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              📋 Same as Planned
            </button>
            <p className="text-purple-200 text-sm mt-3 text-center">
              Click to auto-fill exercises from your plan!
            </p>
          </div>
        )}

        {went === 'yes' && (
          <div className="space-y-5">
            {bps.map((bp, bpI) => (
              <div key={bpI} className="border-2 border-gray-700 rounded-xl p-5 bg-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-white text-lg font-semibold">
                    💪 Body Part {bpI + 1}
                  </label>
                  {bps.length > 1 && (
                    <button 
                      onClick={() => removeBodyPart(bpI)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label={`Remove body part ${bpI + 1}`}
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
                
                <select 
                  value={bp.bodyPart} 
                  onChange={(e) => updateBodyPart(bpI, e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={`Select body part ${bpI + 1}`}
                >
                  <option value="">Select Body Part...</option>
                  {Object.keys(window.bodyPartExercises).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <div className="space-y-3">
                  {bp.exercises.map((ex, exI) => {
                    const selectedExercises = getSelectedExercises(bpI);
                    return (
                      <div key={exI} className="space-y-2">
                        <div className="flex gap-2">
                          <select 
                            value={ex.exercise} 
                            onChange={(e) => updateExercise(bpI, exI, 'exercise', e.target.value)}
                            disabled={!bp.bodyPart}
                            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label={`Select exercise ${exI + 1} for body part ${bpI + 1}`}
                          >
                            <option value="">Select Exercise...</option>
                            {bp.bodyPart && window.bodyPartExercises[bp.bodyPart]?.map(exercise => {
                              const isSelected = selectedExercises.includes(exercise) && ex.exercise !== exercise;
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
                              onClick={() => removeExercise(bpI, exI)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 rounded-lg transition-colors"
                              aria-label={`Remove exercise ${exI + 1}`}
                            >
                              <Trash2 />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex gap-2 items-center pl-4">
                          <input 
                            type="number" 
                            placeholder="Weight (kg)" 
                            value={ex.weight} 
                            onChange={(e) => updateExercise(bpI, exI, 'weight', e.target.value)}
                            disabled={ex.isNA}
                            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            min="0"
                            step="0.5"
                            aria-label={`Weight for exercise ${exI + 1}`}
                          />
                          <label className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-600 transition-colors">
                            <input 
                              type="checkbox"
                              checked={ex.isNA}
                              onChange={(e) => updateExercise(bpI, exI, 'isNA', e.target.checked)}
                              className="w-4 h-4 accent-blue-600"
                              aria-label="Mark as not applicable"
                            />
                            <span className="text-white text-sm font-medium">N/A</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                  <button 
                    onClick={() => addExercise(bpI)}
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
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add Another Body Part
            </button>
          </div>
        )}

        {went === 'no' && (
          <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-6 mb-6">
            <p className="text-red-300 italic text-center text-lg">
              "{window.motivationalQuotes[Math.floor(Math.random() * window.motivationalQuotes.length)]}"
            </p>
          </div>
        )}

        {went && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800 sticky bottom-0 bg-gray-900">
            <button 
              onClick={handleDownloadCalendar}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download />
              Download Calendar File
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};