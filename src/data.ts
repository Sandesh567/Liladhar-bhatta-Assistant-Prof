export const CONFIG = {
PROFILE_IMAGE_SRC: "/profile.jpg",
PROFILE_IMAGE_ALT: "Portrait of Lila Dhar Bhatta, Assistant Professor of English Education",

  SIGNATURE_SRC: "",

  ENABLE_INTRO_ANIMATION: true,   
  INTRO_ENABLED: true,          
  INTRO_VARIANT: "lesson" as "lesson" | "none", 
  INTRO_PLAY_ONCE_PER_SESSION: true, 
  INTRO_DURATION_SCALE: 1.0,      

  INTRO_CONTENT: {
    sentenceParts: {
      pre: "She ",
      wrongWord: "go",
      correctedWord: "goes",
      post: " to the campus every day.",
      endorsement: "Good!"
    },
    diagram: {
      subject: "She",
      verb: "goes",
      prepPhrase: "to the campus",
      adverbial: "every day",
      labels: {
        subject: "SUBJECT",
        verb: "VERB",
        prepPhrase: "Prepositional Phrase",
        adverbial: "Adverbial (Frequency)"
      }
    },
    ghostNotes: {
      partsOfSpeechTitle: "English Grammar · Parts of Speech",
      partsOfSpeechText: "Noun · Pronoun · Verb · Adjective\nAdverb · Preposition · Conjunction",
      alphabet: "Aa  Bb  Cc  Dd  Ee  Ff  Gg  Hh",
      etymologyTitle: "Etymology Note",
      etymologyPhonetic: "pedagogy /'pɛd.ə.ɡɒdʒ.i/",
      etymologyRoot: "← Gr. paidagōgós: paîs (child) + agōgós (leader)",
      tenseTitle: "Tense & Aspect System",
      tenseTimeline: "Past ◄—— Present (Habitual) ——► Future",
      tenseFormula: "She + [V-s] (3rd person singular)",
      phoneticsTitle: "Phonemic Transcription",
      phoneticsSymbols: "/θ/ think · /ð/ this · /ə/ schwa"
    }
  },
  
  WIPE_THRESHOLD_PX: 140,         
  WIPE_DURATION_MS: 1100,         
  WIPE_COOLDOWN_MS: 900,          

  BOARD_MAX_WIDTH: 1600,          

 
  CV_SHOW_EMAIL: true,            
  CV_SHOW_PHONE: true,            
  CV_SHOW_ADDRESS: "city" as "full" | "city" | "none", 
  CV_SHOW_PERSONAL_DETAILS: false,
  CV_SHOW_PHOTO: false            
};

export const DATA = {
  personal: {
    name: "Lila Dhar Bhatta", 
    currentTitle: "Assistant Professor of English Education", 
    institution: "Ghanteshwar Multiple Campus", 
    department: "English Education", 
    address: "Dhangadhi Sub-Metropolitan city Ward No-4, Kailali, Sudur Paschim Province, Nepal", 
    addressFull: "Dhangadhi Sub-Metropolitan City, Ward No-4, Kailali, Sudur Paschim Province, Nepal", 
    addressCity: "Dhangadhi, Kailali, Sudur Paschim Province, Nepal", 
    phone: "9868563482", 
    email: "liladharbhatta123@gmail.com", 
    dobBs: "2033/2/14 B.S.", 
    dobAd: "27th May 1976", 
    nationality: "Nepali", 
    maritalStatus: "Married", 
    gender: "Male", 
    religion: "Hindu", 
    careerObjective: "To obtain a responsible position in an educational institutional where I can apply my knowledge, teaching skills, and contribute to students learning and institutional development."
  },

  bio: "Assistant Professor of English Education at Ghanteshwar Multiple Campus, Far Western Region, Nepal. With over 27 years of progressive teaching experience—advancing from lower secondary language teaching in Dhangadhi to secondary school vice-principalship, higher secondary leadership, and university-level B.Ed. teacher education—he focuses on English language teaching pedagogy, curriculum dissemination, teacher capacity enhancement, and academic writing standards across Sudur Paschim Province.",

  teachingPositions: [
    {
      id: "teach-4",
      order: 4,
      role: "Assistant Professor of English Education",
      subRole: "Partial English Education Teacher (2069/5/25 – 2073/10/5 B.S.)",
      institution: "Ghanteshwar Multiple Campus",
      location: "Jorayal R.M. -4, Doti, Nepal",
      period: "2069/5/25 B.S. – Present (Assistant Professor since 2073/10/6 B.S. onwards)",
      periodShort: "2069 B.S. – Present",
      isCurrent: true,
      tier: "recent",
      trainingsAndAwards: [
        "Attended a one-day orientation program on “B.Ed. Curriculum” on 17th Paush 2057 B.S.",
        "Attended a three-day workshop on “Curriculum Dissemination for Undergraduate and Graduate Level” organized by RMC Tikapur Multiple Campus in collaboration with University Grants Commission (UGC) from Jestha 04 to 06, 2080 B.S.",
        "Attended 4 credits (60 hours) Training / Workshop on “Faculty Capacity Enhancement for Faculty Members” organized by Far Western University, supported by UGC under Nurturing Excellence in Higher Education Program (NEHEP) conducted in two phases (Phase I: 15–19 Nov 2025, Phase II: 22–26 Jan 2026 A.D.)",
        "Attended a three-day workshop on “Academic Journal Article Writing & Publication Process” organized by Research Management Cell (RMC), Jayaprithvi Multiple Campus, Bhopur, Bajhang in collaboration with UGC, on 16–18 May 2026"
      ],
      cvSource: "CV: Teaching Experience & Training #4"
    },
    {
      id: "teach-3",
      order: 3,
      role: "+2 Level English Language Teacher cum +2 Coordinator",
      institution: "Soo Jung Higher Secondary School",
      location: "Rajpur, Doti, Nepal",
      period: "3rd Baisakh 2067 B.S. – 3rd Baisakh 2069 B.S.",
      periodShort: "2067 – 2069 B.S.",
      isCurrent: false,
      tier: "mid",
      trainingsAndAwards: [
        "Attended 30 days Training on “Leadership Development for Head Teachers of Institutional Schools” organized by TTC, Dipayal, Doti, passed with 1st Division"
      ],
      cvSource: "CV: Teaching Experience & Training #3"
    },
    {
      id: "teach-2",
      order: 2,
      role: "Secondary Level English Language Teacher & Vice Principal",
      subRole: "Vice Principal from 2064 up to 2067 B.S.",
      institution: "Far West Regional Police Boarding School",
      location: "Dhangadhi, Kailali, Nepal",
      period: "2057/9/1 – 2067/1/1 B.S.",
      periodShort: "2057 – 2067 B.S.",
      isCurrent: false,
      tier: "aged",
      trainingsAndAwards: [
        "Attended four-day teacher training program on English across curriculum",
        "Awarded with the “Best Teacher in Academic Year 2061 B.S.” on the occasion of 20th Annual Function"
      ],
      cvSource: "CV: Teaching Experience & Training #2"
    },
    {
      id: "teach-1",
      order: 1,
      role: "Lower Secondary Level English Language Teacher",
      institution: "Barsha Nava Jyoti English Boarding School",
      location: "Dhangadhi, Kailali, Nepal",
      period: "2053/9/1 – 2057/3/23 B.S.",
      periodShort: "2053 – 2057 B.S.",
      isCurrent: false,
      tier: "earliest",
      trainingsAndAwards: [
        "Attended one-day workshop on English Language Teaching organised by Ratna Sagar P. Ltd., Delhi, India in collaboration with Ratna Pustak Bhandar, Kathmandu, Nepal"
      ],
      cvSource: "CV: Teaching Experience & Training #1"
    }
  ],

  teachingExperience: [
    {
      id: "teach-4",
      role: "Assistant Professor of English Education",
      previousRole: "Partial English Education Teacher (2069/5/25 – 2073/10/5 B.S.)",
      institution: "Ghanteshwar Multiple Campus",
      location: "Jorayal R.M. -4, Doti, Nepal",
      periodBs: "2073/10/6 B.S. onwards (Since Jan 2017)",
      periodAd: "2017 – Present",
      isCurrent: true,
      tier: "recent",
      notes: "Appointed Assistant Professor following university-level teaching as Partial Teacher in English Education. Actively participates in UGC faculty capacity development and academic research workshops.",
      cvSource: "CV: Teaching Experience & Training #4"
    },
    {
      id: "teach-3",
      role: "+2 Level Eng. Language Teacher cum +2 Coordinator",
      institution: "Soo Jung Higher Secondary School",
      location: "Rajpur, Doti, Nepal",
      periodBs: "3rd Baisakh 2067 B.S. – 3rd Baisakh 2069 B.S.",
      periodAd: "2010 – 2012 A.D.",
      isCurrent: false,
      tier: "mid",
      notes: "Led the higher secondary (+2) academic coordination while teaching senior English language curricula. Completed 30 days Training on 'Leadership Development for Head Teachers' at TTC Dipayal with 1st Division.",
      cvSource: "CV: Teaching Experience & Training #3"
    },
    {
      id: "teach-2",
      role: "Secondary Level Eng. Language Teacher & Vice Principal",
      institution: "Far West Regional Police Boarding School",
      location: "Dhangadhi, Kailali, Nepal",
      periodBs: "(Vice Principal: 2064 – 2067 B.S.) ",
      periodAd: "2001 – 2010 A.D.",
      isCurrent: false,
      tier: "aged",
      notes: "Served a decade at this regional institutional school. Promoted to Vice Principal (2064–2067 B.S.). Awarded 'Best Teacher in Academic Year 2061 B.S.' at the 20th Annual Function.",
      cvSource: "CV: Teaching Experience & Training #2"
    },
    {
      id: "teach-1",
      role: "Lower Secondary Level Eng. Language Teacher",
      institution: "Barsha Nava Jyoti Eng. Boarding School",
      location: "Dhangadhi, Kailali, Nepal",
      periodBs: "2053/9/1 – 2057/3/23 B.S.",
      periodAd: "1996 – 2000 A.D.",
      isCurrent: false,
      tier: "earliest",
      notes: "Commenced his teaching career in Dhangadhi, teaching foundational English language and attending early ELT pedagogy workshops.",
      cvSource: "CV: Teaching Experience & Training #1"
    }
  ],

  education: [
    {
      id: "edu-1",
      order: 1,
      degree: "Master’s Degree in English (M.A.)",
      institution: "Kumaun University",
      location: "Nainital, India",
      year: "2008 A.D.",
      result: "45.8% (3rd Division)",
      cvSource: "CV: Educational Qualification #1 ('Nainitaal' fixed to 'Nainital')"
    },
    {
      id: "edu-2",
      order: 2,
      degree: "One-Year Bachelor’s Degree in English Education (B.Ed.)",
      institution: "Tribhuwan University",
      location: "Nepal",
      year: "2061 B.S.",
      result: "48.33% (Second Division)",
      cvSource: "CV: Educational Qualification #2"
    },
    {
      id: "edu-3",
      order: 3,
      degree: "Bachelor’s Degree in English (B.A.)",
      institution: "Tribhuwan University",
      location: "Nepal",
      year: "2056 B.S.",
      result: "42.36% (Pass)",
      cvSource: "CV: Educational Qualification #3"
    },
    {
      id: "edu-4",
      order: 4,
      degree: "Proficiency Certificate Examination (I.A.)",
      institution: "Tribhuwan University",
      location: "Nepal",
      year: "2052 B.S.",
      result: "45.3% (Second Division)",
      cvSource: "CV: Educational Qualification #4 ('Exam.' expanded, 'T.U.,Nepal' to Tribhuwan University)"
    },
    {
      id: "edu-5",
      order: 5,
      degree: "School Level Certificate Examination (S.L.C.)",
      institution: "S.L.C. Board of Nepal",
      location: "Nepal",
      year: "2049 B.S.",
      result: "56.71% (Good Second Division)",
      cvSource: "CV: Educational Qualification #5 ('Exam.' expanded, 'Bord of Nepal' fixed to 'Board of Nepal')"
    }
  ],

  skills: [
    "Effective Communication and presentation",
    "Classroom management",
    "Lesson planning and assessment",
    "Academic writing and grammar",
    "MS Word, PowerPoint, Google Classroom"
  ],

  languages: [
    { name: "Dotali", proficiency: "Native" },
    { name: "Nepali", proficiency: "Fluent" },
    { name: "English", proficiency: "Academic & Instructional" },
    { name: "Hindi", proficiency: "Fluent" }
  ],

  references: "Available upon request",

  researchAndInterests: [
    {
      id: "interest-1",
      title: "English Language Teaching (ELT) & Pedagogy",
      scope: "Core Field",
      details: "Comprehensive language pedagogy spanning school-level communicative English to university teacher-training methodologies.",
      marginQuestion: "Why does this matter in Far-Western Nepal?",
      marginAnswer: "In multi-lingual regions like Sudur Paschim, foundational ELT bridges local mother tongues (such as Dotali and Nepali) with global academic English, fostering genuine communicative competence and classroom engagement.",
      cvSource: "CV: Teaching Experience Barsha Nava Jyoti & Far West Police School; Ratna Sagar ELT Workshop; Key Skills: 'Effective Communication', 'Classroom management'",
      connectedIds: ["teach-1", "teach-2", "train-1", "edu-2"]
    },
    {
      id: "interest-2",
      title: "Curriculum Dissemination & Higher Education",
      scope: "University Pedagogy",
      details: "Undergraduate and Graduate B.Ed. curriculum implementation, orientation, and evaluation frameworks under Tribhuwan University and UGC Nepal.",
      marginQuestion: "What is Curriculum Dissemination?",
      marginAnswer: "It is the structured translation of national university syllabi and learning outcomes into concrete, localized lesson modules and student assessments across regional tertiary campuses.",
      cvSource: "CV: Workshops on 'Curriculum Dissemination for Undergraduate and Graduate Level' (UGC/Tikapur) and 'B.Ed. Curriculum Orientation'",
      connectedIds: ["train-2", "train-5", "edu-2", "teach-4"]
    },
    {
      id: "interest-3",
      title: "Academic Writing, Grammar & Publication Process",
      scope: "Scholarship & Research",
      details: "Grammar pedagogy, academic prose standards, research article drafting, and peer-reviewed journal submission mechanisms.",
      marginQuestion: "How does this apply to faculty development?",
      marginAnswer: "Academic writing workshops equip regional college faculty to convert classroom action research and educational inquiries into peer-reviewed scholarly publications.",
      cvSource: "CV: Workshop on 'Academic Journal Article Writing & Publication Process' (RMC Jayaprithvi/UGC, 2026); Key Skills: 'Academic writing and grammar'",
      connectedIds: ["train-3", "train-4", "teach-4"]
    },
    {
      id: "interest-4",
      title: "Educational Leadership & Teacher Capacity Building",
      scope: "Institutional Development",
      details: "Institutional school administration, secondary-level coordination, and faculty capacity building supported by UGC NEHEP.",
      marginQuestion: "What was his administrative trajectory?",
      marginAnswer: "He served as Vice Principal at Far West Regional Police Boarding School (2064–2067 B.S.) and +2 Coordinator at Soo Jung Higher Secondary School, completing 30-day leadership training with 1st Division honors.",
      cvSource: "CV: Vice Principal (2064-2067), +2 Coordinator, 30-day TTC Dipayal Leadership Training, and NEHEP Far Western University 4-credit training",
      connectedIds: ["teach-2", "teach-3", "train-4", "train-6"]
    }
  ],

  workshopsAndTraining: [
    {
      id: "train-3",
      title: "Academic Journal Article Writing & Publication Process",
      organizer: "Research Management Cell (RMC), Jayaprithvi Multiple Campus in collaboration with UGC Nepal",
      location: "Bhopur, Bajhang",
      date: "16–18 May 2026",
      type: "Research & Publishing",
      year: "2026",
      cvSource: "CV: Teaching Experience & Training #4"
    },
    {
      id: "train-4",
      title: "Faculty Capacity Enhancement for Faculty Members (4 Credits / 60 Hours)",
      organizer: "Far Western University, supported by UGC under Nurturing Excellence in Higher Education Program (NEHEP)",
      location: "Far Western University, Nepal",
      date: "Phase I: 15–19 Nov 2025 | Phase II: 22–26 Jan 2026 A.D.",
      type: "Faculty Enhancement",
      year: "2025–2026",
      cvSource: "CV: Teaching Experience & Training #4"
    },
    {
      id: "train-2",
      title: "Curriculum Dissemination for Undergraduate and Graduate Level",
      organizer: "Research Management Cell (RMC), Tikapur Multiple Campus in collaboration with UGC",
      location: "Tikapur, Kailali",
      date: "Jestha 04–06, 2080 B.S. (May 2023)",
      type: "Curriculum Dissemination",
      year: "2080 B.S.",
      cvSource: "CV: Teaching Experience & Training #4"
    },
    {
      id: "train-6",
      title: "Leadership Development for Head Teachers of Institutional Schools (30 Days)",
      organizer: "Teacher Training Center (TTC)",
      location: "Dipayal, Doti",
      date: "Completed during tenure at Soo Jung Higher Secondary School (2067–2069 B.S.)",
      type: "Leadership & Administration",
      year: "2068 B.S.",
      cvSource: "CV: Teaching Experience & Training #3"
    },
    {
      id: "train-7",
      title: "English Across Curriculum Teacher Training (4 Days)",
      organizer: "Far West Regional Police Boarding School",
      location: "Dhangadhi, Kailali",
      date: "Conducted during tenure at FWRPBS",
      type: "Pedagogical Training",
      year: "2060 B.S.",
      cvSource: "CV: Teaching Experience & Training #2"
    },
    {
      id: "train-5",
      title: "B.Ed. Curriculum Orientation Program (1 Day)",
      organizer: "Tribhuwan University affiliated institutional program",
      location: "Sudur Paschim, Nepal",
      date: "17th Paush 2057 B.S. (Dec 2000)",
      type: "Curriculum Orientation",
      year: "2057 B.S.",
      cvSource: "CV: Teaching Experience & Training #4"
    },
    {
      id: "train-1",
      title: "Workshop on English Language Teaching (1 Day)",
      organizer: "Ratna Sagar P. Ltd., Delhi in collaboration with Ratna Pustak Bhandar, Kathmandu",
      location: "Kathmandu / Kailali",
      date: "Conducted during tenure at Barsha Nava Jyoti",
      type: "ELT Pedagogy",
      year: "2054 B.S.",
      cvSource: "CV: Teaching Experience & Training #1"
    }
  ],

  awards: [
    {
      id: "award-1",
      title: "Best Teacher in Academic Year 2061 B.S.",
      conferredBy: "Far West Regional Police Boarding School, Dhangadhi",
      occasion: "Awarded on the occasion of the 20th Annual Function",
      year: "2061 B.S. (~2004 A.D.)",
      cvSource: "CV: Teaching Experience & Training #2"
    },
    {
      id: "award-2",
      title: "1st Division Certification in Leadership Development",
      conferredBy: "Teacher Training Center (TTC), Dipayal, Doti",
      occasion: "30 Days Training for Head Teachers of Institutional Schools",
      year: "2068 B.S.",
      cvSource: "CV: Teaching Experience & Training #3"
    }
  ]
};

export const BOARDS = [
  { id: 'hero', title: 'Faculty Profile', label: 'Profile' },
  { id: 'about', title: 'Academic Background', label: 'About' },
  { id: 'pedagogy', title: 'Pedagogy & Focus Areas', label: 'Pedagogy' },
  { id: 'teaching', title: 'Teaching Trajectory', label: 'Teaching' },
  { id: 'workshops', title: 'Faculty Development (UGC)', label: 'Workshops' },
  { id: 'credentials', title: 'Degrees & Honors', label: 'Degrees' },
  { id: 'leadership', title: 'Institutional Leadership & Service', label: 'Leadership' },
  { id: 'contact', title: 'Whiteboard Slate & Contact', label: 'Contact' }
];