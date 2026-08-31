/**
 * Enigma Machine Logic Engine
 * Implements cycle-accurate Enigma I / M3 simulation.
 */

export class EnigmaEngine {
  constructor() {
    // Standard Enigma Rotors wiring and notches
    this.ROTOR_DEFS = {
      'I':   { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
      'II':  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
      'III': { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
      'IV':  { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
      'V':   { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' }
    };

    // Reflector B (UKW-B)
    this.REFLECTOR_DEFS = {
      'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT'
    };

    // Default configuration
    this.rotors = ['I', 'II', 'III']; // Left, Middle, Right
    this.positions = [0, 0, 0];       // Left, Middle, Right (0-25)
    this.ringSettings = [0, 0, 0];    // Left, Middle, Right (0-25)
    this.reflector = 'B';
    this.plugboard = {};              // Bidirectional mapping of character numbers
  }

  // Set rotors (e.g. ['I', 'II', 'III'])
  setRotors(rotorList) {
    this.rotors = [...rotorList];
  }

  // Set positions by letters (e.g. 'AAA')
  setPositions(posString) {
    for (let i = 0; i < 3; i++) {
      this.positions[i] = posString.charCodeAt(i) - 65;
    }
  }

  // Set positions by numeric array [left, mid, right]
  setPositionsArray(arr) {
    this.positions = [...arr];
  }

  // Set ring settings by letters (e.g. 'AAA')
  setRingSettings(ringString) {
    for (let i = 0; i < 3; i++) {
      this.ringSettings[i] = ringString.charCodeAt(i) - 65;
    }
  }

  // Set plugboard connections from strings like "AB CD EF"
  setPlugboard(connectionsString) {
    this.plugboard = {};
    if (!connectionsString) return;
    const pairs = connectionsString.toUpperCase().split(/\s+/);
    for (const pair of pairs) {
      if (pair.length === 2) {
        const charA = pair.charCodeAt(0) - 65;
        const charB = pair.charCodeAt(1) - 65;
        this.plugboard[charA] = charB;
        this.plugboard[charB] = charA;
      }
    }
  }

  // Add a single plugboard pair
  addPlug(char1, char2) {
    const val1 = char1.toUpperCase().charCodeAt(0) - 65;
    const val2 = char2.toUpperCase().charCodeAt(0) - 65;
    
    // Remove existing connections for these characters first
    this.removePlug(char1);
    this.removePlug(char2);

    this.plugboard[val1] = val2;
    this.plugboard[val2] = val1;
  }

  // Remove connection for a character
  removePlug(char) {
    const val = char.toUpperCase().charCodeAt(0) - 65;
    if (this.plugboard[val] !== undefined) {
      const partner = this.plugboard[val];
      delete this.plugboard[val];
      delete this.plugboard[partner];
    }
  }

  // Get current plugboard pairs as a list of strings
  getPlugboardPairs() {
    const pairs = [];
    const seen = new Set();
    for (const key in this.plugboard) {
      const k = parseInt(key);
      const v = this.plugboard[k];
      if (!seen.has(k) && !seen.has(v)) {
        pairs.push(String.fromCharCode(65 + k) + String.fromCharCode(65 + v));
        seen.add(k);
        seen.add(v);
      }
    }
    return pairs;
  }

  // Single step increment of rotors (handles double-stepping)
  step() {
    const rNotch = this.ROTOR_DEFS[this.rotors[2]].notch.charCodeAt(0) - 65;
    const mNotch = this.ROTOR_DEFS[this.rotors[1]].notch.charCodeAt(0) - 65;

    let stepLeft = false;
    let stepMiddle = false;
    let stepRight = true; // Right rotor always steps

    // Double-stepping anomaly:
    // If middle rotor is at its notch, it steps itself and the left rotor.
    if (this.positions[1] === mNotch) {
      stepMiddle = true;
      stepLeft = true;
    }
    
    // If right rotor is at its notch, it steps the middle rotor.
    if (this.positions[2] === rNotch) {
      stepMiddle = true;
    }

    if (stepLeft) this.positions[0] = (this.positions[0] + 1) % 26;
    if (stepMiddle) this.positions[1] = (this.positions[1] + 1) % 26;
    if (stepRight) this.positions[2] = (this.positions[2] + 1) % 26;
  }

  // Substitute a character index through a rotor
  // direction: 'forward' (right-to-left) or 'backward' (left-to-right)
  substituteRotor(charIdx, rotorName, position, ringSetting, direction) {
    const def = this.ROTOR_DEFS[rotorName];
    // Offset is (position - ringSetting)
    const offset = (position - ringSetting + 26) % 26;
    
    if (direction === 'forward') {
      // Input contact index entering the rotor
      const inputContact = (charIdx + offset) % 26;
      // Wiring substitution
      const mappedChar = def.wiring.charCodeAt(inputContact) - 65;
      // Output contact index leaving the rotor
      return (mappedChar - offset + 26) % 26;
    } else {
      // Entering from left contact index
      const inputContact = (charIdx + offset) % 26;
      // Inverse wiring search
      const mappedContact = def.wiring.indexOf(String.fromCharCode(65 + inputContact));
      // Output contact index leaving the rotor
      return (mappedContact - offset + 26) % 26;
    }
  }

  // Substitute a character index through the Reflector
  substituteReflector(charIdx) {
    const def = this.REFLECTOR_DEFS[this.reflector];
    return def.charCodeAt(charIdx) - 65;
  }

  // Core substitution function
  // Encrypts/Decrypts a single uppercase character (A-Z)
  // Returns object with the output character and the full path of indices for visual animation
  pressKey(char) {
    const upperChar = char.toUpperCase();
    if (upperChar < 'A' || upperChar > 'Z') {
      return { char: upperChar, path: [] };
    }

    // Step rotors before encryption
    this.step();

    let currentIdx = upperChar.charCodeAt(0) - 65;
    const path = [];

    // 1. Keyboard Input
    path.push({ stage: 'keyboard', val: currentIdx });

    // 2. Plugboard Forward
    if (this.plugboard[currentIdx] !== undefined) {
      currentIdx = this.plugboard[currentIdx];
    }
    path.push({ stage: 'plugboard_in', val: currentIdx });

    // 3. Rotors Forward (Right -> Middle -> Left)
    currentIdx = this.substituteRotor(currentIdx, this.rotors[2], this.positions[2], this.ringSettings[2], 'forward');
    path.push({ stage: 'rotor_right_in', val: currentIdx });

    currentIdx = this.substituteRotor(currentIdx, this.rotors[1], this.positions[1], this.ringSettings[1], 'forward');
    path.push({ stage: 'rotor_mid_in', val: currentIdx });

    currentIdx = this.substituteRotor(currentIdx, this.rotors[0], this.positions[0], this.ringSettings[0], 'forward');
    path.push({ stage: 'rotor_left_in', val: currentIdx });

    // 4. Reflector UKW-B
    currentIdx = this.substituteReflector(currentIdx);
    path.push({ stage: 'reflector', val: currentIdx });

    // 5. Rotors Backward (Left -> Middle -> Right)
    currentIdx = this.substituteRotor(currentIdx, this.rotors[0], this.positions[0], this.ringSettings[0], 'backward');
    path.push({ stage: 'rotor_left_out', val: currentIdx });

    currentIdx = this.substituteRotor(currentIdx, this.rotors[1], this.positions[1], this.ringSettings[1], 'backward');
    path.push({ stage: 'rotor_mid_out', val: currentIdx });

    currentIdx = this.substituteRotor(currentIdx, this.rotors[2], this.positions[2], this.ringSettings[2], 'backward');
    path.push({ stage: 'rotor_right_out', val: currentIdx });

    // 6. Plugboard Backward
    if (this.plugboard[currentIdx] !== undefined) {
      currentIdx = this.plugboard[currentIdx];
    }
    path.push({ stage: 'plugboard_out', val: currentIdx });

    // 7. Lampboard Output
    path.push({ stage: 'lampboard', val: currentIdx });

    return {
      char: String.fromCharCode(65 + currentIdx),
      path: path,
      positions: [...this.positions] // Return rotor positions after stepping
    };
  }

  // Encipher a full text string (no stepping visualization, updates state)
  cryptText(text) {
    let result = '';
    for (const char of text.toUpperCase()) {
      if (char >= 'A' && char <= 'Z') {
        result += this.pressKey(char).char;
      } else {
        result += char;
      }
    }
    return result;
  }

  // Run self-contained tests to ensure math is 100% accurate
  static runTests() {
    console.log('--- ENIGMA ENGINE: RUNNING SELF-TESTS ---');
    const engine = new EnigmaEngine();
    
    // Test 1: Basic Encryption Reciprocity
    engine.setRotors(['I', 'II', 'III']);
    engine.setRingSettings('AAA');
    engine.setPositions('AAA');
    engine.setPlugboard('AB CD EF');
    
    const originalText = 'HELLOENIGMA';
    console.log(`Original Text: ${originalText}`);
    
    const ciphertext = engine.cryptText(originalText);
    console.log(`Ciphertext:    ${ciphertext}`);
    
    // Reset positions and plugboard for decryption
    engine.setPositions('AAA');
    const decryptedText = engine.cryptText(ciphertext);
    console.log(`Decrypted:     ${decryptedText}`);
    
    const reciprocityPass = decryptedText === originalText;
    console.log(`Test 1 (Reciprocity): ${reciprocityPass ? 'PASS' : 'FAIL'}`);

    // Test 2: Double-stepping Anomaly
    // Rotor I notch at Q (16), Rotor II at E (4), Rotor III at V (21)
    engine.setRotors(['I', 'II', 'III']);
    engine.setRingSettings('AAA');
    
    // Setup right before double-stepping
    // Middle rotor II starts at D (3), right rotor III at U (20)
    engine.setPositions('ADU'); // [0, 3, 20]
    
    // Press a key: Right steps U->V (21). Middle doesn't step.
    engine.pressKey('A');
    let pos = engine.positions.map(p => String.fromCharCode(65 + p)).join('');
    console.log(`Step 1 (Expected ADV): ${pos}`);
    const step1Pass = pos === 'ADV';
    
    // Press a key: Right rotor is at V (its notch). It will step to W (22) and trigger Middle rotor D->E (4)
    engine.pressKey('A');
    pos = engine.positions.map(p => String.fromCharCode(65 + p)).join('');
    console.log(`Step 2 (Expected AEW): ${pos}`);
    const step2Pass = pos === 'AEW';

    // Press a key: Middle rotor is now at E (its notch). Double stepping triggers!
    // Right rotor steps W->X (23). Middle rotor steps E->F (5). Left rotor steps A->B (1).
    engine.pressKey('A');
    pos = engine.positions.map(p => String.fromCharCode(65 + p)).join('');
    console.log(`Step 3 (Expected BFX): ${pos}`);
    const step3Pass = pos === 'BFX';

    const doubleSteppingPass = step1Pass && step2Pass && step3Pass;
    console.log(`Test 2 (Double-Stepping): ${doubleSteppingPass ? 'PASS' : 'FAIL'}`);

    const allPassed = reciprocityPass && doubleSteppingPass;
    console.log(`--- ENIGMA ENGINE TESTS: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'} ---`);
    return allPassed;
  }
}
