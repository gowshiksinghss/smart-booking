export const mockSurveys = [
  {
    id: "survey-1",
    title: "Classroom Resource Feedback",
    questions: [
      {
        id: "q1",
        questionText: "How would you rate the audio/visual quality in this room?",
        type: "rating", // rating, choice, text
        options: [1, 2, 3, 4, 5]
      },
      {
        id: "q2",
        questionText: "Did the air conditioning function properly during the session?",
        type: "choice",
        options: ["Yes, perfect", "It was too cold", "It was not cold enough", "It was broken"]
      }
    ]
  },
  {
    id: "survey-2",
    title: "Session Feedback Survey",
    questions: [
      {
        id: "q3",
        questionText: "Was the material covered in today's class clear and understandable?",
        type: "choice",
        options: ["Strongly Agree", "Agree", "Neutral", "Disagree"]
      },
      {
        id: "q4",
        questionText: "What tool/topic would you like to explore further in the next session?",
        type: "text"
      }
    ]
  }
];
