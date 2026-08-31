import { create } from 'zustand';
import { EnigmaEngine } from '../engine/enigmaEngine';

const enigmaInstance = new EnigmaEngine();

export const useEnigmaStore = create((set, get) => ({
  // 1. Simulation Engine Reference
  engine: enigmaInstance,

  // 2. State variables
  rotors: ['I', 'II', 'III'],
  positions: [0, 0, 0], // numerical indexes 0-25
  ringSettings: [0, 0, 0],
  plugboardPairs: [], 
  xp: 0,
  currentRoom: 1,
  timeRemaining: 70 * 60, // 70 minutes
  consoleLogs: [
    { type: 'system', text: 'Enlace de radio militar establecido con Bletchley Park.' },
    { type: 'system', text: 'Mensaje interceptado: "HOYSEDECIDEELDETALLE"' },
    { type: 'instruction', text: 'Configura la máquina y tipea el texto para descifrarlo.' }
  ],
  activeQuiz: null, // { type: 'rotor'|'reflector'|'plugboard', question, options, correct, solved: false }
  
  // 3. New Gamification / Escape Room States
  tutorialCompleted: false,
  finalVictory: false,
  roomTasks: {
    1: {
      plugboardConnected: false,
      quizSolved: false,
      completed: false
    },
    2: {
      rotorClicked: false,
      quizSolved: false,
      completed: false
    },
    3: {
      reflectorClicked: false,
      quizSolved: false,
      messageDecrypted: false,
      completed: false
    }
  },

  // 4. Actions
  setPositions: (newPositions) => {
    get().engine.setPositionsArray(newPositions);
    set({ positions: [...newPositions] });
  },
  
  pressKey: (char) => {
    const result = get().engine.pressKey(char);
    const newLogs = [
      ...get().consoleLogs,
      { type: 'input', text: `Operador pulsa: <strong>${char.toUpperCase()}</strong> &rarr; Cifra como: <strong style="color: var(--color-glow);">${result.char}</strong>` }
    ];
    set({ 
      positions: [...result.positions], 
      consoleLogs: newLogs 
    });
    return result; 
  },

  cryptText: (text) => {
    const result = get().engine.cryptText(text);
    
    // Check if the decrypted result matches the target military intercept
    const cleanText = text.toUpperCase().replace(/\s+/g, '');
    const isTarget = cleanText === 'HOYSEDECIDEELDETALLE' || result.toUpperCase() === 'HOYSEDECIDEELDETALLE';
    
    const newLogs = [
      ...get().consoleLogs,
      { type: 'output', text: `[CADENA] Tipeado: "${text.toUpperCase()}" &rarr; Resultado: <span style="color: var(--color-glow); font-weight:bold;">"${result}"</span>` }
    ];

    if (isTarget && get().currentRoom === 3) {
      newLogs.push({ type: 'success', text: '<span style="color: var(--color-glow); font-weight:bold;">[VICTORIA] ¡MENSAJE DESCIFRADO CON ÉXITO! Has salvado la transmisión y completado la misión.</span>' });
      
      const newTasks = { ...get().roomTasks };
      newTasks[3].messageDecrypted = true;
      set({ roomTasks: newTasks, finalVictory: true });
      get().checkRoomCompletion(3);
    }

    set({ 
      positions: [...get().engine.positions], 
      consoleLogs: newLogs 
    });
  },

  addPlug: (char1, char2) => {
    get().engine.addPlug(char1, char2);
    
    const newTasks = { ...get().roomTasks };
    if (get().currentRoom === 1) {
      newTasks[1].plugboardConnected = true;
    }
    
    set({ 
      plugboardPairs: get().engine.getPlugboardPairs(),
      roomTasks: newTasks
    });
    get().checkRoomCompletion(1);
  },

  removePlug: (char) => {
    get().engine.removePlug(char);
    set({ plugboardPairs: get().engine.getPlugboardPairs() });
  },

  resetMachine: () => {
    get().engine.setPositions('AAA');
    get().engine.setPlugboard('');
    
    const newTasks = { ...get().roomTasks };
    // Keep task status but allow resetting connections
    set({
      positions: [0, 0, 0],
      plugboardPairs: [],
      consoleLogs: [
        ...get().consoleLogs,
        { type: 'system', text: 'Máquina reiniciada a configuración por defecto.' }
      ]
    });
  },

  setRoom: (roomNum) => {
    set({ 
      currentRoom: roomNum,
      consoleLogs: [
        ...get().consoleLogs,
        { type: 'system', text: `[PEDAGOGÍA] Ingresando a la <strong>Sala ${roomNum}</strong>` }
      ]
    });
  },

  decrementTime: () => {
    if (get().finalVictory) return;
    set((state) => ({ timeRemaining: Math.max(0, state.timeRemaining - 1) }));
  },

  triggerQuiz: (quizType) => {
    const newTasks = { ...get().roomTasks };
    if (quizType === 'rotor' && get().currentRoom === 2) {
      newTasks[2].rotorClicked = true;
    } else if (quizType === 'reflector' && get().currentRoom === 3) {
      newTasks[3].reflectorClicked = true;
    }
    set({ roomTasks: newTasks });
    get().checkRoomCompletion(get().currentRoom);

    let quizData = {};
    if (quizType === 'rotor') {
      quizData = {
        type: 'rotor',
        title: 'Rotores y Doble Paso (Sala 2)',
        desc: 'Los rotores realizan la sustitución de las letras. Al girar, la muesca mecánica de un rotor hace avanzar al siguiente. Sin embargo, debido al diseño mecánico de los trinquetes de la Enigma, el rotor del medio puede dar un paso extra consecutivo (el efecto "Double-stepping").',
        question: 'Si los rotores están configurados en "ADU" y el rotor derecho (III) llega a su muesca "V", ¿qué ocurrirá en el siguiente paso de cifrado?',
        options: [
          'Solo gira el rotor derecho (pasa a ADV).',
          'El rotor derecho pasa a V y arrastra al central (pasa a AEW).',
          'Todos los rotores retroceden una posición.'
        ],
        correct: 1,
        successMsg: '¡Excelente predicción matemática! Has comprendido la física del rotor.',
        failMsg: 'Incorrecto. Recordá que la muesca del rotor III (V) empuja el trinquete del rotor central en la siguiente tecla.'
      };
    } else if (quizType === 'plugboard') {
      quizData = {
        type: 'plugboard',
        title: 'El Clavijero Simétrico (Sala 1)',
        desc: 'El clavijero intercambia pares de letras de forma simétrica antes y después de pasar por los rotores. Si la letra A está puenteada con la letra M, la señal eléctrica cruza el circuito del clavijero de forma idéntica en ambas direcciones.',
        question: 'Si conectamos la letra "A" con la "M" en el clavijero, ¿cuál será el resultado de teclear una "A" justo antes de entrar a los rotores?',
        options: [
          'La corriente fluirá por el canal de la letra A.',
          'La corriente se desviará al canal de la letra M.',
          'La corriente se anula y la lámpara no se enciende.'
        ],
        correct: 1,
        successMsg: '¡Correcto! El clavijero permuta de forma recíproca las entradas.',
        failMsg: 'No. El clavijero conecta físicamente A con M, así que A se convierte en M antes del rotor.'
      };
    } else if (quizType === 'reflector') {
      quizData = {
        type: 'reflector',
        title: 'El Reflector UKW-B (Sala 3)',
        desc: 'El Reflector desvía la señal de regreso a través de los rotores por un camino distinto. Esto permite que el proceso de cifrado y descifrado sea idéntico (recíproco). Sin embargo, introduce la debilidad de que una letra NUNCA puede cifrarse como sí misma.',
        question: '¿Por qué la regla de que "una letra nunca se cifra como sí misma" facilitó el trabajo de descifrado en Bletchley Park?',
        options: [
          'Porque permitía buscar palabras probables ("cribs") y descartar alineaciones incompatibles.',
          'Porque reducía el tamaño de la clave a la mitad.',
          'Porque hacía que el reflector se fundiera con corrientes altas.'
        ],
        correct: 0,
        successMsg: '¡Extraordinario análisis criptográfico! Esa debilidad permitió diseñar las máquinas "Bombe" de Alan Turing.',
        failMsg: 'Incorrecto. Esa propiedad geométrica permitía deslizar palabras probables y descartar colisiones.'
      };
    }
    set({ activeQuiz: quizData });
  },

  solveQuiz: (isCorrect, score) => {
    if (isCorrect) {
      const room = get().currentRoom;
      const newTasks = { ...get().roomTasks };
      newTasks[room].quizSolved = true;

      set((state) => ({ 
        xp: state.xp + score,
        activeQuiz: null,
        roomTasks: newTasks,
        consoleLogs: [
          ...state.consoleLogs,
          { type: 'success', text: `<span style="color: var(--color-glow);">[LOGRO] +${score} XP por resolver acertijo de la Sala ${room}.</span>` }
        ]
      }));
      get().checkRoomCompletion(room);
    }
  },

  closeQuiz: () => set({ activeQuiz: null }),
  
  addLog: (logType, logText) => {
    set((state) => ({
      consoleLogs: [...state.consoleLogs, { type: logType, text: logText }]
    }));
  },

  completeTutorial: () => set({ tutorialCompleted: true }),

  // Validates active room objectives
  checkRoomCompletion: (room) => {
    const tasks = get().roomTasks[room];
    let isCompleted = false;

    if (room === 1) {
      isCompleted = tasks.plugboardConnected && tasks.quizSolved;
    } else if (room === 2) {
      isCompleted = tasks.rotorClicked && tasks.quizSolved;
    } else if (room === 3) {
      isCompleted = tasks.reflectorClicked && tasks.quizSolved && tasks.messageDecrypted;
    }

    if (isCompleted && !tasks.completed) {
      const newTasks = { ...get().roomTasks };
      newTasks[room].completed = true;
      set({ 
        roomTasks: newTasks,
        consoleLogs: [
          ...get().consoleLogs,
          { type: 'success', text: `<span style="color: var(--color-glow); font-weight:bold;">[MISION] ¡Objetivos de la Sala ${room} completados! Acceso a la siguiente sala desbloqueado.</span>` }
        ]
      });
    }
  }
}));
