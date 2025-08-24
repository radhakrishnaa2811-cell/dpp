export interface Phoneme {
  sound: string;
  letters: string;
  type: 'consonant' | 'vowel' | 'digraph' | 'blend' | 'vowel_team' | 'r_controlled' | 'diphthong' | 'final_stable';
}

export interface Word {
  word: string;
  type: 'real' | 'nonsense' | 'sight';
  sentence: string;
  imageQuery: string;
}

export interface GradeLevel {
  name: string;
  description: string;
}

export const gradeLevels: GradeLevel[] = [
  {
    name: "Kindergarten",
    description: "🌱 Kindergarten / Beginning of 1st Grade",
    
  },
  {
    name: "First",
    description: "📘 End of 1st / Beginning of 2nd",
  },
  {
    name: "Second",
    description: "📗 End of 2nd / Beginning of 3rd",
  }
];