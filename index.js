// The twelve tones of the chromatic scale.
const twelveTones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const rootNote = process.argv[2];

if (rootNote === undefined || !twelveTones.includes(rootNote)) {
    throw Error('Please give the root note as the first argument. Allowed values: ' + twelveTones.join(', '))
}


// Gets the steps of a diatonic scale by a start index relative to the ionian scale.
function getSteps(startIndex) {
    const ionianSteps = [2,2,1,2,2,2,1];
    return ionianSteps.slice(startIndex).concat(ionianSteps.slice(0, startIndex));
}

// Get the index after adding to the index, adjusted to not overflow length.
function getLoopedIndex(current, addSteps, length) {
    return current + addSteps - (current + addSteps > length -1 ? length : 0);
}

/**
 * Returns the notes of a scale by recursively going through the steps of the scale.
 * @param {number} previousNoteIndex - the index of the previous note of the scale, 
 * relative to the twelveTones array.
 * @param {number} stepIndex - the index of the steps array, which contains the next note.
 * @param {number[]} steps - the array containing the steps of the scale
 * @param {string[]} notes - the initial value for the notes to return
 * @returns the notes of a scale
 */
function getScaleNotes(previousNoteIndex, stepIndex, steps, notes) {
    const noteIndex = getLoopedIndex(previousNoteIndex, steps[stepIndex], twelveTones.length);
    const accNotes = notes.concat([twelveTones[noteIndex]]);

    if (stepIndex === steps.length - 1) {
        return accNotes;
    } else {
        return getScaleNotes(noteIndex, stepIndex + 1, steps, accNotes);
    }
}

// Get the chord symbol of a triad (e.g. nothing for major, 'm' for minor)
function getTriadSymbol(root, third, fifth) {
    const rootIndex = twelveTones.indexOf(root);
    // Adjust the twelve tones, so that the root note is first. More convenient to calculate
    // the intervals this way.
    const adjustedTwelveTones = twelveTones.slice(rootIndex).concat(twelveTones.slice(0, rootIndex));
    const thirdInterval = adjustedTwelveTones.indexOf(third);
    const fifthInterval = adjustedTwelveTones.indexOf(fifth);

    if (thirdInterval === 4) {
        // major
        if (fifthInterval === 7) {
            return '';
        }
        // augmented
        else if (fifthInterval === 8) {
            return 'aug'
        }
    } else if (thirdInterval === 3) {
        // minor
        if (fifthInterval === 7) {
            return 'm';
        }
        // diminished
        else if (fifthInterval === 6) {
            return 'dim'
        }
    }

    throw Error(`Unidentified triad: [${root}, ${third}, ${fifth}]`);
}

// Map of modes to the steps in their scales.
const modeSteps = {
    ionian: getSteps(0),
    dorian: getSteps(1),
    phrygian: getSteps(2),
    lydian: getSteps(3),
    mixolydian: getSteps(4),
    aeolian: getSteps(5),
    locrian: getSteps(6),
};

for (const [mode, steps] of Object.entries(modeSteps)) {
    const rootNoteIndex = twelveTones.indexOf(rootNote);

    const notes = getScaleNotes(rootNoteIndex, 0, steps, [rootNote]);
    // Remove last note, as it will be the same as the root note
    notes.pop();
  
    const triads = notes.map((note, index) => {
        const third = notes[getLoopedIndex(index, 2, notes.length)];
        const fifth = notes[getLoopedIndex(index, 4, notes.length)];
        return [note, third, fifth];
    });
    const chords = triads.map(([root, third, fifth]) => root + getTriadSymbol(root, third, fifth));

    console.log(rootNote, mode, chords.join(', '));
}
