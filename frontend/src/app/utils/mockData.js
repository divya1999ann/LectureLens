// Mock users for authentication
export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@lectureai.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 2,
    name: 'Dr. Sarah Smith',
    email: 'sarah@lectureai.com',
    password: 'teacher123',
    role: 'teacher'
  },
  {
    id: 3,
    name: 'John Student',
    email: 'student@lectureai.com',
    password: 'student123',
    role: 'student'
  }
];

// Mock teachers data
export const mockTeachers = [
  { id: 2, name: 'Dr. Sarah Smith', email: 'sarah.smith@university.edu', subjects: 2, students: 45, joinedDate: '2023-09-01', status: 'active', department: 'Computer Science' },
  { id: 4, name: 'Prof. John Davis', email: 'john.davis@university.edu', subjects: 3, students: 67, joinedDate: '2023-08-15', status: 'active', department: 'Computer Science' },
  { id: 5, name: 'Dr. Emily Chen', email: 'emily.chen@university.edu', subjects: 1, students: 32, joinedDate: '2024-01-10', status: 'active', department: 'Data Science' },
  { id: 6, name: 'Prof. Michael Brown', email: 'michael.brown@university.edu', subjects: 2, students: 54, joinedDate: '2023-07-20', status: 'active', department: 'Computer Science' }
];

// Mock subjects data
export const mockSubjects = [
  {
    id: 1,
    code: 'CS601',
    name: 'Machine Learning Systems',
    instructor: 'Dr. Sarah Smith',
    instructorId: 2,
    lectureCount: 12,
    studentCount: 34,
    progress: 75,
    semester: 'Spring 2024',
    department: 'Computer Science',
    description: 'Advanced course covering the design and implementation of production ML systems including data pipelines, model serving, and monitoring.',
    lastAccessed: '2024-02-08T10:30:00',
    lastUpdated: '2024-02-08'
  },
  {
    id: 2,
    code: 'CS602',
    name: 'Deep Learning',
    instructor: 'Prof. John Davis',
    instructorId: 4,
    lectureCount: 10,
    studentCount: 28,
    progress: 60,
    semester: 'Spring 2024',
    department: 'Computer Science',
    description: 'Comprehensive study of deep neural networks, CNNs, RNNs, and transformer architectures with practical implementations.',
    lastAccessed: '2024-02-07T14:20:00',
    lastUpdated: '2024-02-07'
  },
  {
    id: 3,
    code: 'CS603',
    name: 'Natural Language Processing',
    instructor: 'Dr. Emily Chen',
    instructorId: 5,
    lectureCount: 8,
    studentCount: 25,
    progress: 45,
    semester: 'Spring 2024',
    department: 'Data Science',
    description: 'Modern NLP techniques including transformers, BERT, GPT, and applications in text analysis and generation.',
    lastAccessed: '2024-02-06T09:15:00',
    lastUpdated: '2024-02-06'
  },
  {
    id: 4,
    code: 'CS604',
    name: 'Computer Vision',
    instructor: 'Prof. Michael Brown',
    instructorId: 6,
    lectureCount: 11,
    studentCount: 30,
    progress: 80,
    semester: 'Spring 2024',
    department: 'Computer Science',
    description: 'Image processing, object detection, semantic segmentation, and modern CV architectures.',
    lastAccessed: '2024-02-05T16:45:00',
    lastUpdated: '2024-02-05'
  },
  {
    id: 5,
    code: 'CS605',
    name: 'Reinforcement Learning',
    instructor: 'Dr. Sarah Smith',
    instructorId: 2,
    lectureCount: 9,
    studentCount: 22,
    progress: 50,
    semester: 'Spring 2024',
    department: 'Computer Science',
    description: 'Introduction to RL algorithms, Q-learning, policy gradients, and applications in game AI and robotics.',
    lastAccessed: '2024-02-04T11:20:00',
    lastUpdated: '2024-02-04'
  }
];

// Mock lectures data
export const mockLectures = [
  { id: 1, subjectId: 1, number: 1, title: 'Introduction to ML Systems', date: '2024-02-01', pages: '15 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },
  { id: 2, subjectId: 1, number: 2, title: 'Data Pipeline Architecture', date: '2024-02-03', pages: '22 pages', hasTranscript: true, hasPPT: true, hasNotes: false, status: 'Processed' },
  { id: 3, subjectId: 1, number: 3, title: 'Feature Engineering', date: '2024-02-05', pages: '18 pages', hasTranscript: true, hasPPT: false, hasNotes: true, status: 'Processed' },
  { id: 4, subjectId: 1, number: 4, title: 'Model Training Infrastructure', date: '2024-02-07', pages: '25 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },
  { id: 5, subjectId: 1, number: 5, title: 'Model Serving and Deployment', date: '2024-02-08', pages: '20 pages', hasTranscript: false, hasPPT: true, hasNotes: false, status: 'Processing' },

  { id: 6, subjectId: 2, number: 1, title: 'Neural Networks Fundamentals', date: '2024-02-01', pages: '30 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },
  { id: 7, subjectId: 2, number: 2, title: 'Convolutional Neural Networks', date: '2024-02-03', pages: '28 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },
  { id: 8, subjectId: 2, number: 3, title: 'Recurrent Neural Networks', date: '2024-02-05', pages: '24 pages', hasTranscript: true, hasPPT: true, hasNotes: false, status: 'Processed' },

  { id: 9, subjectId: 3, number: 1, title: 'Introduction to NLP', date: '2024-02-02', pages: '19 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },
  { id: 10, subjectId: 3, number: 2, title: 'Word Embeddings', date: '2024-02-04', pages: '21 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },

  { id: 11, subjectId: 4, number: 1, title: 'Image Processing Basics', date: '2024-02-01', pages: '16 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },
  { id: 12, subjectId: 4, number: 2, title: 'Object Detection', date: '2024-02-03', pages: '32 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },

  { id: 13, subjectId: 5, number: 1, title: 'RL Foundations', date: '2024-02-02', pages: '26 pages', hasTranscript: true, hasPPT: true, hasNotes: true, status: 'Processed' },
  { id: 14, subjectId: 5, number: 2, title: 'Q-Learning', date: '2024-02-04', pages: '23 pages', hasTranscript: true, hasPPT: true, hasNotes: false, status: 'Processed' }
];

// Sample transcript
export const sampleTranscript = `[00:00:00] Welcome everyone to today's lecture on Machine Learning Systems. I'm excited to dive into this fascinating topic with you all.

[00:02:15] Let's start by understanding what we mean by ML Systems. Unlike traditional software, ML systems have unique characteristics that make them both powerful and challenging to build.

[00:05:30] First, let's talk about the data pipeline. This is the backbone of any ML system. We need to collect, clean, transform, and store data efficiently. The quality of your data directly impacts your model's performance.

[00:10:45] Moving on to feature engineering. This is where domain knowledge meets data science. Good features can make a simple model outperform a complex one with poor features.

[00:15:32] ML systems combine traditional software engineering principles with machine learning models to create production-ready applications. This requires understanding both worlds deeply.

[00:20:00] Let's discuss the architecture. A typical ML system has several layers: data ingestion, preprocessing, feature store, model training, model serving, and monitoring.

[00:25:15] One of the biggest challenges is handling model drift. Your model's performance can degrade over time as the real-world data distribution changes. Continuous monitoring is essential.

[00:30:00] Now, let's look at some real-world examples. Companies like Netflix, Uber, and Airbnb have built sophisticated ML systems at scale.

[00:35:45] In conclusion, building ML systems requires a holistic approach combining software engineering, machine learning, and DevOps practices. Thank you for your attention!`;

// Mock AI responses for chat
export const mockAIResponses = [
  "Based on the selected lectures, here's a comprehensive summary of the main concepts discussed...",
  "Let me break down that topic for you. From Lecture {lecture}, we covered...",
  "Great question! According to the lecture material, the key points are...",
  "I found relevant information in {count} lectures. Here's what was discussed...",
  "To answer your question, let me reference the specific sections from the lectures...",
];

// Sample live transcription texts
export const sampleLiveTexts = [
  "Today we'll discuss neural networks and their applications in modern machine learning.",
  "Let's start with the basics of backpropagation and how gradients flow through the network.",
  "The key concept here is understanding the loss function and how we optimize it.",
  "Remember, overfitting is a common problem we need to address through regularization techniques.",
  "Cross-validation helps us evaluate our model's performance more reliably.",
  "Feature scaling is crucial for many algorithms, especially gradient-based methods.",
  "Let's look at some real-world examples to solidify these concepts.",
  "In practice, we often use libraries like TensorFlow or PyTorch for implementation.",
  "Hyperparameter tuning can significantly impact your model's performance.",
  "Don't forget to split your data properly into training, validation, and test sets."
];

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const getCurrentDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
