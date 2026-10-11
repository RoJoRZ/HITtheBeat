import type { DemoAudio } from './AudioLab';
export interface ExampleExercise extends DemoAudio { instruction: string; attention: string[]; tab: boolean }
export const exercises: ExampleExercise[] = [
  { id: 'wisselslag', title: 'Wisselslag', bpm: 90, duration: 48, tab: true, instruction: 'Speel elke noot met een afwisselende neer- en opgaande aanslag. Houd je hand ontspannen en speel alle noten even luid.', attention: ['Ontspannen pols', 'Gelijkmatige timing', 'Zuivere noten'] },
  { id: 'pentatoniek', title: 'Pentatoniek', bpm: 85, duration: 72, tab: true, instruction: 'Speel de toonladder rustig omhoog en omlaag. Laat iedere noot helder klinken voordat je naar de volgende gaat. Houd de vingers dicht bij de snaren en blijf ontspannen ademen.\n\nBegin met een kleine beweging vanuit je pols. Controleer of je duim prettig rust en je schouders laag blijven. Als een overgang lastig voelt, isoleer dan een kort fragment en speel dat eerst langzaam. Verhoog het tempo pas wanneer de beweging soepel blijft.\n\nLuister naar de lengte van de noten: ook bij een snaarwisseling blijft het ritme gelijk. Neem de tijd om de laatste noot uit te laten klinken. Herhaal deze aanwijzingen bij het afdalen, want die beweging kan anders aanvoelen dan het omhoog spelen.', attention: ['Kleine bewegingen', 'Vaste vingerzetting', 'Ontspannen schouders'] },
  { id: 'akkoorden', title: 'Akkoordwissels', bpm: 70, duration: 56, tab: false, instruction: 'Wissel tussen de akkoorden Em en Am. Houd de puls vast en bereid de volgende vingerzetting op tijd voor. Deze oefening heeft geen tablatuur: gebruik de opdracht als leidraad.', attention: ['Blijf doortellen', 'Laat de snaren vrij klinken'] },
];
export interface ExampleStep { id: number; exercise: string; repetitions: number; bpm: number; fragment: boolean; start?: number; end?: number; fragmentId?: string; fragmentName?: string }
export const initialSteps: ExampleStep[] = [
  { id: 1, exercise: 'wisselslag', repetitions: 1, bpm: 75, fragment: false },
  { id: 2, exercise: 'wisselslag', repetitions: 2, bpm: 95, fragment: true, start: 12, end: 24, fragmentId: 'example-wisselslag', fragmentName: 'Lastige overgang' },
  { id: 3, exercise: 'wisselslag', repetitions: 1, bpm: 85, fragment: false },
  { id: 4, exercise: 'pentatoniek', repetitions: 1, bpm: 85, fragment: false },
];
export const findExercise = (id: string) => exercises.find(exercise => exercise.id === id) ?? exercises[0];
export const stepDuration = (step: ExampleStep) => {
  const exercise = findExercise(step.exercise);
  return (step.fragment ? (step.end ?? 24) - (step.start ?? 12) : exercise.duration) * exercise.bpm / step.bpm * step.repetitions;
};

export const exampleFragments = (id: string) => [{ id: `example-${id}`, name: 'Lastige overgang', start: 12, end: 24 }];
