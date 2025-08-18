export interface Phoneme {
  sound: string;
  letters: string;
  type: 'consonant' | 'vowel' | 'digraph' | 'blend' | 'vowel_team' | 'r_controlled' | 'diphthong' | 'final_stable';
}

export interface Word {
  word: string;
  phonemes: Phoneme[];
  type: 'real' | 'nonsense' | 'sight';
  imageQuery: string;
}

export interface GradeLevel {
  name: string;
  description: string;
  words: Word[];
}

export const gradeLevels: GradeLevel[] = [
  {
    name: "Kindergarten",
    description: "🌱 Kindergarten / Beginning of 1st Grade",
    words: [
      // Real Words
      {
        word: "yet",
        phonemes: [
          { sound: "/y/", letters: "y", type: "consonant" },
          { sound: "/e/", letters: "e", type: "vowel" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon yet"
      },
      {
        word: "chap",
        phonemes: [
          { sound: "/ch/", letters: "ch", type: "digraph" },
          { sound: "/a/", letters: "a", type: "vowel" },
          { sound: "/p/", letters: "p", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon man person"
      },
      {
        word: "bed",
        phonemes: [
          { sound: "/b/", letters: "b", type: "consonant" },
          { sound: "/e/", letters: "e", type: "vowel" },
          { sound: "/d/", letters: "d", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon bed bedroom"
      },
      {
        word: "she",
        phonemes: [
          { sound: "/sh/", letters: "sh", type: "digraph" },
          { sound: "/ē/", letters: "e", type: "vowel_team" }
        ],
        type: "real",
        imageQuery: "cartoon girl woman"
      },
      {
        word: "ran",
        phonemes: [
          { sound: "/r/", letters: "r", type: "consonant" },
          { sound: "/a/", letters: "a", type: "vowel" },
          { sound: "/n/", letters: "n", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon running child"
      },
      {
        word: "hi",
        phonemes: [
          { sound: "/h/", letters: "h", type: "consonant" },
          { sound: "/ī/", letters: "i", type: "vowel" }
        ],
        type: "real",
        imageQuery: "cartoon waving hello"
      },
      {
        word: "go",
        phonemes: [
          { sound: "/g/", letters: "g", type: "consonant" },
          { sound: "/ō/", letters: "o", type: "vowel" }
        ],
        type: "real",
        imageQuery: "cartoon arrow go"
      },
      {
        word: "quit",
        phonemes: [
          { sound: "/kw/", letters: "qu", type: "blend" },
          { sound: "/i/", letters: "i", type: "vowel" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon stop quit"
      },
      {
        word: "cup",
        phonemes: [
          { sound: "/k/", letters: "c", type: "consonant" },
          { sound: "/ŭ/", letters: "u", type: "vowel" },
          { sound: "/p/", letters: "p", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon cup mug"
      },
      {
        word: "with",
        phonemes: [
          { sound: "/w/", letters: "w", type: "consonant" },
          { sound: "/i/", letters: "i", type: "vowel" },
          { sound: "/th/", letters: "th", type: "digraph" }
        ],
        type: "real",
        imageQuery: "cartoon together with"
      },
      // Nonsense Words
      {
        word: "som",
        phonemes: [
          { sound: "/s/", letters: "s", type: "consonant" },
          { sound: "/o/", letters: "o", type: "vowel" },
          { sound: "/m/", letters: "m", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon alien creature"
      },
      {
        word: "jat",
        phonemes: [
          { sound: "/j/", letters: "j", type: "consonant" },
          { sound: "/a/", letters: "a", type: "vowel" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon silly monster"
      },
      {
        word: "ket",
        phonemes: [
          { sound: "/k/", letters: "k", type: "consonant" },
          { sound: "/e/", letters: "e", type: "vowel" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon funny animal"
      },
      {
        word: "zix",
        phonemes: [
          { sound: "/z/", letters: "z", type: "consonant" },
          { sound: "/i/", letters: "i", type: "vowel" },
          { sound: "/ks/", letters: "x", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon robot toy"
      },
      {
        word: "vut",
        phonemes: [
          { sound: "/v/", letters: "v", type: "consonant" },
          { sound: "/ŭ/", letters: "u", type: "vowel" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon space creature"
      },
      // Sight Words
      {
        word: "is",
        phonemes: [
          { sound: "/i/", letters: "i", type: "vowel" },
          { sound: "/z/", letters: "s", type: "consonant" }
        ],
        type: "sight",
        imageQuery: "cartoon equals sign"
      },
      {
        word: "the",
        phonemes: [
          { sound: "/th/", letters: "th", type: "digraph" },
          { sound: "/ə/", letters: "e", type: "vowel" }
        ],
        type: "sight",
        imageQuery: "cartoon pointing finger"
      },
      {
        word: "my",
        phonemes: [
          { sound: "/m/", letters: "m", type: "consonant" },
          { sound: "/ī/", letters: "y", type: "vowel" }
        ],
        type: "sight",
        imageQuery: "cartoon child pointing self"
      },
      {
        word: "of",
        phonemes: [
          { sound: "/ŭ/", letters: "o", type: "vowel" },
          { sound: "/v/", letters: "f", type: "consonant" }
        ],
        type: "sight",
        imageQuery: "cartoon ownership possession"
      },
      {
        word: "and",
        phonemes: [
          { sound: "/a/", letters: "a", type: "vowel" },
          { sound: "/n/", letters: "n", type: "consonant" },
          { sound: "/d/", letters: "d", type: "consonant" }
        ],
        type: "sight",
        imageQuery: "cartoon plus sign addition"
      }
    ]
  },
  {
    name: "First Grade",
    description: "📘 End of 1st / Beginning of 2nd",
    words: [
      // Real Words
      {
        word: "quaint",
        phonemes: [
          { sound: "/kw/", letters: "qu", type: "blend" },
          { sound: "/ā/", letters: "ai", type: "vowel_team" },
          { sound: "/n/", letters: "n", type: "consonant" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon old fashioned house"
      },
      {
        word: "clunk",
        phonemes: [
          { sound: "/k/", letters: "c", type: "consonant" },
          { sound: "/l/", letters: "l", type: "consonant" },
          { sound: "/ŭ/", letters: "u", type: "vowel" },
          { sound: "/ng/", letters: "n", type: "consonant" },
          { sound: "/k/", letters: "k", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon metal clunk sound"
      },
      {
        word: "coast",
        phonemes: [
          { sound: "/k/", letters: "c", type: "consonant" },
          { sound: "/ō/", letters: "oa", type: "vowel_team" },
          { sound: "/s/", letters: "s", type: "consonant" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "real",
        imageQuery: "cartoon beach coast ocean"
      },
      {
        word: "phone",
        phonemes: [
          { sound: "/f/", letters: "ph", type: "digraph" },
          { sound: "/ō/", letters: "o", type: "vowel" },
          { sound: "/n/", letters: "n", type: "consonant" },
          { sound: "/", letters: "e", type: "vowel" }
        ],
        type: "real",
        imageQuery: "cartoon telephone phone"
      },
      // Nonsense Words
      {
        word: "sprill",
        phonemes: [
          { sound: "/s/", letters: "s", type: "consonant" },
          { sound: "/p/", letters: "p", type: "consonant" },
          { sound: "/r/", letters: "r", type: "consonant" },
          { sound: "/i/", letters: "i", type: "vowel" },
          { sound: "/l/", letters: "ll", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon silly creature dancing"
      },
      {
        word: "slaff",
        phonemes: [
          { sound: "/s/", letters: "s", type: "consonant" },
          { sound: "/l/", letters: "l", type: "consonant" },
          { sound: "/a/", letters: "a", type: "vowel" },
          { sound: "/f/", letters: "ff", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon funny monster laughing"
      },
      // Sight Words
      {
        word: "from",
        phonemes: [
          { sound: "/f/", letters: "f", type: "consonant" },
          { sound: "/r/", letters: "r", type: "consonant" },
          { sound: "/ŭ/", letters: "o", type: "vowel" },
          { sound: "/m/", letters: "m", type: "consonant" }
        ],
        type: "sight",
        imageQuery: "cartoon arrow pointing from"
      },
      {
        word: "does",
        phonemes: [
          { sound: "/d/", letters: "d", type: "consonant" },
          { sound: "/ŭ/", letters: "oe", type: "vowel" },
          { sound: "/z/", letters: "s", type: "consonant" }
        ],
        type: "sight",
        imageQuery: "cartoon question mark doing"
      }
    ]
  },
  {
    name: "Second Grade",
    description: "📗 End of 2nd / Beginning of 3rd",
    words: [
      // Real Words
      {
        word: "shower",
        phonemes: [
          { sound: "/sh/", letters: "sh", type: "digraph" },
          { sound: "/ow/", letters: "ow", type: "diphthong" },
          { sound: "/er/", letters: "er", type: "r_controlled" }
        ],
        type: "real",
        imageQuery: "cartoon shower bathroom"
      },
      {
        word: "candle",
        phonemes: [
          { sound: "/k/", letters: "c", type: "consonant" },
          { sound: "/a/", letters: "a", type: "vowel" },
          { sound: "/n/", letters: "n", type: "consonant" },
          { sound: "/d/", letters: "d", type: "consonant" },
          { sound: "/le/", letters: "le", type: "final_stable" }
        ],
        type: "real",
        imageQuery: "cartoon candle flame"
      },
      {
        word: "puzzle",
        phonemes: [
          { sound: "/p/", letters: "p", type: "consonant" },
          { sound: "/u/", letters: "u", type: "vowel" },
          { sound: "/z/", letters: "zz", type: "consonant" },
          { sound: "/le/", letters: "le", type: "final_stable" }
        ],
        type: "real",
        imageQuery: "cartoon puzzle pieces jigsaw"
      },
      // Nonsense Words
      {
        word: "plet",
        phonemes: [
          { sound: "/p/", letters: "p", type: "consonant" },
          { sound: "/l/", letters: "l", type: "consonant" },
          { sound: "/e/", letters: "e", type: "vowel" },
          { sound: "/t/", letters: "t", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon alien pet"
      },
      {
        word: "flemp",
        phonemes: [
          { sound: "/f/", letters: "f", type: "consonant" },
          { sound: "/l/", letters: "l", type: "consonant" },
          { sound: "/e/", letters: "e", type: "vowel" },
          { sound: "/m/", letters: "m", type: "consonant" },
          { sound: "/p/", letters: "p", type: "consonant" }
        ],
        type: "nonsense",
        imageQuery: "cartoon bouncy blob creature"
      },
      // Sight Words
      {
        word: "there",
        phonemes: [
          { sound: "/th/", letters: "th", type: "digraph" },
          { sound: "/air/", letters: "ere", type: "r_controlled" }
        ],
        type: "sight",
        imageQuery: "cartoon pointing there location"
      },
      {
        word: "people",
        phonemes: [
          { sound: "/p/", letters: "p", type: "consonant" },
          { sound: "/ē/", letters: "eo", type: "vowel_team" },
          { sound: "/p/", letters: "p", type: "consonant" },
          { sound: "/le/", letters: "le", type: "final_stable" }
        ],
        type: "sight",
        imageQuery: "cartoon group people family"
      }
    ]
  }
];