// Add styles for table and margins
const style = document.createElement('style');
style.textContent = `
    .table-responsive {
        margin-bottom: 2rem;
    }
    .table thead {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    }
    .table thead th {
        color: white;
        font-weight: 600;
        border: none;
        padding: 15px;
    }
    .table tbody td {
        vertical-align: middle;
    }
    .badge {
        padding: 8px 12px;
        font-weight: 500;
    }
    .btn-sm {
        padding: 6px 12px;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);

// Mock data for quizzes
const mockQuizzes = [
    {
        id: 'quiz-1',
        title: 'quiz-1',
        questions: [
            {
                id: '1',
                question: 'What is the hardest substance in the human body?',
                options: {
                    a: 'Bone',
                    b: 'Tooth pulp',
                    c: 'Dentin',
                    d: 'Enamel'
                },
                correctAnswer: 'd'
            },
            {
                id: '2',
                question: 'How many permanent teeth does an adult human usually have?',
                options: {
                    a: '28',
                    b: '30',
                    c: '32',
                    d: '36'
                },
                correctAnswer: 'c'
            }
        ]
    },
    {
        id: 'quiz-2',
        title: 'quiz-2',
        questions: [
            {
                id: '1',
                question: 'Which type of teeth are used for grinding food?',
                options: {
                    a: 'Incisors',
                    b: 'Canines',
                    c: 'Molars',
                    d: 'Premolars'
                },
                correctAnswer: 'c'
            },
            {
                id: '2',
                question: 'At what age do most children begin to lose their baby teeth?',
                options: {
                    a: '2–3 years',
                    b: '4–5 years,',
                    c: '6–7 years',
                    d: '9–10 years'
                },
                correctAnswer: 'c'
            }
        ]
    }
];

// Quiz Manager Object
const quizManager = {
    currentQuizId: null,

    // Initialize the page
    init() {
        this.loadQuizzes();
        this.setupEventListeners();
    },

    // Set up event listeners
    setupEventListeners() {
        document.getElementById('addQuizBtn').addEventListener('click', () => {
            this.showCreateQuizModal();
        });
    },

    // Load quizzes into the table
    loadQuizzes() {
        const tableBody = document.getElementById('quizzesTableBody');
        tableBody.innerHTML = '';

        mockQuizzes.forEach(quiz => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${quiz.title}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-2" onclick="quizManager.viewQuestions('${quiz.id}')">
                        View Questions
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    },

    // Show modal to create a new quiz
    showCreateQuizModal() {
        const modal = new bootstrap.Modal(document.getElementById('createQuizModal'));
        modal.show();
    },

    // Create a new quiz
    createQuiz() {
        const quizTitle = document.getElementById('newQuizTitle').value;
        const question = document.getElementById('newQuestion').value;
        const optionA = document.getElementById('newOptionA').value;
        const optionB = document.getElementById('newOptionB').value;
        const optionC = document.getElementById('newOptionC').value;
        const optionD = document.getElementById('newOptionD').value;
        const correctAnswer = document.getElementById('newCorrectAnswer').value;

        if (!quizTitle || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            this.showSuccessToast('Please fill in all fields');
            return;
        }

        const newQuiz = {
            id: `QZ${String(mockQuizzes.length + 1).padStart(3, '0')}`,
            title: quizTitle,
            questions: [
                {
                    id: 'Q1',
                    question: question,
                    options: {
                        a: optionA,
                        b: optionB,
                        c: optionC,
                        d: optionD
                    },
                    correctAnswer: correctAnswer
                }
            ]
        };

        mockQuizzes.push(newQuiz);
        this.loadQuizzes();

        // Clear the form
        document.getElementById('newQuizForm').reset();

        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createQuizModal'));
        modal.hide();

        // Show success message
        this.showSuccessToast('Quiz created successfully!');
    },

    // View questions for a specific quiz
    viewQuestions(quizId) {
        this.currentQuizId = quizId;
        const quiz = mockQuizzes.find(q => q.id === quizId);
        if (!quiz) return;

        const tableBody = document.getElementById('quizQuestionsTableBody');
        tableBody.innerHTML = '';

        quiz.questions.forEach(question => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${question.id}</td>
                <td>${question.question}</td>
                <td>
                    A: ${question.options.a}<br>
                    B: ${question.options.b}<br>
                    C: ${question.options.c}<br>
                    D: ${question.options.d}
                </td>
                <td>${question.options[question.correctAnswer]}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="quizManager.removeQuestion('${quizId}', '${question.id}')">
                        Remove
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('quizQuestionsModal'));
        modal.show();
    },

    // Show modal to add a new question
    showAddQuestionToQuizModal() {
        const modal = new bootstrap.Modal(document.getElementById('addQuestionToQuizModal'));
        modal.show();
    },

    // Add a new question to the current quiz
    addQuestion() {
        const quiz = mockQuizzes.find(q => q.id === this.currentQuizId);
        if (!quiz) return;

        const newQuestion = {
            id: `Q${quiz.questions.length + 1}`,
            question: document.getElementById('newTheQuestion').value,
            options: {
                a: document.getElementById('newOptionA').value,
                b: document.getElementById('newOptionB').value,
                c: document.getElementById('newOptionC').value,
                d: document.getElementById('newOptionD').value
            },
            correctAnswer: document.getElementById('newCorrectAnswer').value
        };

        quiz.questions.push(newQuestion);
        this.viewQuestions(this.currentQuizId);

        // Clear the form
        document.getElementById('newQuestionForm').reset();

        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addQuestionToQuizModal'));
        modal.hide();

        // Show success message
        this.showSuccessToast('Question added successfully!');
    },

    // Remove a question from the current quiz
    removeQuestion(quizId, questionId) {
        if (!confirm('Are you sure you want to remove this question?')) return;

        const quiz = mockQuizzes.find(q => q.id === quizId);
        if (!quiz) return;

        const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
            quiz.questions.splice(questionIndex, 1);
            this.viewQuestions(quizId);
            this.showSuccessToast('Question removed successfully!');
        }
    },

    // Show success toast message
    showSuccessToast(message) {
        const toast = document.getElementById('successToast');
        const toastBody = toast.querySelector('.toast-body');
        toastBody.textContent = message;
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    quizManager.init();
});