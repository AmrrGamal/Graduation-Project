import UserService from '../api/UserService.js';
import RoleManager from '../utils/RoleManager.js';

class QuizSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.userService = new UserService();
        this.role = RoleManager.getRoleFromToken();
        this.initialize();
    }

    async initialize() {
        try {
            if (this.role === RoleManager.ROLES.STUDENT) {
                const [availableQuizzes, scores] = await Promise.all([
                    this.userService.getAvailableQuizzes(),
                    this.userService.getQuizScores()
                ]);
                this.renderStudentView(availableQuizzes, scores);
            } else if (this.role === RoleManager.ROLES.ADMIN) {
                const quizzes = await this.userService.getAllQuizzes();
                this.renderAdminView(quizzes);
            }
        } catch (error) {
            console.error('Failed to initialize quiz system:', error);
            this.showError('Failed to load quiz information');
        }
    }

    renderStudentView(quizzes, scores) {
        this.container.innerHTML = `
            <div class="quiz-system">
                <div class="quiz-header">
                    <h2>Available Quizzes</h2>
                </div>

                <div class="quiz-list">
                    ${this.renderQuizList(quizzes)}
                </div>

                <div class="quiz-scores">
                    <h2>Your Quiz Scores</h2>
                    ${this.renderScores(scores)}
                </div>

                <div class="quiz-modal" style="display: none;">
                    <div class="modal-content">
                        <h3>Quiz</h3>
                        <div id="quizContent"></div>
                        <div class="quiz-actions">
                            <button class="submit-quiz-btn">Submit</button>
                            <button class="cancel-quiz-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachStudentEventListeners();
    }

    renderAdminView(quizzes) {
        this.container.innerHTML = `
            <div class="quiz-system">
                <div class="quiz-header">
                    <h2>Quiz Management</h2>
                    <button class="add-quiz-btn">Create New Quiz</button>
                </div>

                <div class="quiz-list">
                    ${this.renderAdminQuizList(quizzes)}
                </div>

                <div class="quiz-modal" style="display: none;">
                    <div class="modal-content">
                        <h3>Create Quiz</h3>
                        <form id="quizForm">
                            <div class="form-group">
                                <label for="quizTitle">Title</label>
                                <input type="text" id="quizTitle" required>
                            </div>
                            <div class="form-group">
                                <label for="quizDescription">Description</label>
                                <textarea id="quizDescription" required></textarea>
                            </div>
                            <div id="questionsContainer">
                                <h4>Questions</h4>
                                <button type="button" class="add-question-btn">Add Question</button>
                            </div>
                            <div class="form-actions">
                                <button type="submit">Save Quiz</button>
                                <button type="button" class="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.attachAdminEventListeners();
    }

    renderQuizList(quizzes) {
        if (!quizzes.length) {
            return '<p class="no-quizzes">No quizzes available at the moment.</p>';
        }

        return `
            <div class="quizzes-grid">
                ${quizzes.map(quiz => `
                    <div class="quiz-card">
                        <h3>${quiz.title}</h3>
                        <p>${quiz.description}</p>
                        <p>Questions: ${quiz.questionCount}</p>
                        <p>Time Limit: ${quiz.timeLimit} minutes</p>
                        <button class="start-quiz-btn" data-quiz-id="${quiz.id}">
                            Start Quiz
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAdminQuizList(quizzes) {
        return `
            <div class="quizzes-grid">
                ${quizzes.map(quiz => `
                    <div class="quiz-card">
                        <h3>${quiz.title}</h3>
                        <p>${quiz.description}</p>
                        <p>Questions: ${quiz.questionCount}</p>
                        <p>Time Limit: ${quiz.timeLimit} minutes</p>
                        <div class="quiz-actions">
                            <button class="edit-quiz-btn" data-quiz-id="${quiz.id}">
                                Edit
                            </button>
                            <button class="delete-quiz-btn" data-quiz-id="${quiz.id}">
                                Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderScores(scores) {
        if (!scores.length) {
            return '<p class="no-scores">You haven\'t taken any quizzes yet.</p>';
        }

        return `
            <div class="scores-table">
                <table>
                    <thead>
                        <tr>
                            <th>Quiz</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scores.map(score => `
                            <tr>
                                <td>${score.quizTitle}</td>
                                <td>${score.score}%</td>
                                <td>${new Date(score.date).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    attachStudentEventListeners() {
        document.querySelectorAll('.start-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => this.startQuiz(btn.dataset.quizId));
        });

        const submitBtn = document.querySelector('.submit-quiz-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitQuiz());
        }

        const cancelBtn = document.querySelector('.cancel-quiz-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideQuizModal());
        }
    }

    attachAdminEventListeners() {
        const addQuizBtn = document.querySelector('.add-quiz-btn');
        if (addQuizBtn) {
            addQuizBtn.addEventListener('click', () => this.showQuizModal());
        }

        document.querySelectorAll('.edit-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editQuiz(btn.dataset.quizId));
        });

        document.querySelectorAll('.delete-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteQuiz(btn.dataset.quizId));
        });

        const quizForm = document.getElementById('quizForm');
        if (quizForm) {
            quizForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuizSubmit();
            });
        }

        const addQuestionBtn = document.querySelector('.add-question-btn');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', () => this.addQuestionField());
        }
    }

    async startQuiz(quizId) {
        try {
            const quiz = await this.userService.getQuiz(quizId);
            this.showQuizModal(quiz);
        } catch (error) {
            console.error('Failed to load quiz:', error);
            this.showError('Failed to load quiz');
        }
    }

    showQuizModal(quiz = null) {
        const modal = document.querySelector('.quiz-modal');
        const quizContent = document.getElementById('quizContent');

        if (quiz) {
            quizContent.innerHTML = this.renderQuizContent(quiz);
        } else {
            quizContent.innerHTML = '';
        }

        modal.style.display = 'block';
    }

    hideQuizModal() {
        const modal = document.querySelector('.quiz-modal');
        modal.style.display = 'none';
    }

    renderQuizContent(quiz) {
        return `
            <div class="quiz-content">
                <h3>${quiz.title}</h3>
                <p>${quiz.description}</p>
                <div class="questions">
                    ${quiz.questions.map((question, index) => `
                        <div class="question">
                            <p>${index + 1}. ${question.text}</p>
                            <div class="options">
                                ${question.options.map(option => `
                                    <label>
                                        <input type="radio" name="q${index}" value="${option}">
                                        ${option}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async submitQuiz() {
        const answers = this.collectAnswers();
        try {
            const result = await this.userService.submitQuizAnswers(answers);
            this.hideQuizModal();
            this.showSuccess('Quiz submitted successfully!');
            this.initialize(); // Refresh scores
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            this.showError('Failed to submit quiz');
        }
    }

    collectAnswers() {
        const answers = [];
        const questions = document.querySelectorAll('.question');

        questions.forEach((question, index) => {
            const selectedOption = question.querySelector('input[type="radio"]:checked');
            answers.push({
                questionId: index,
                answer: selectedOption ? selectedOption.value : null
            });
        });

        return answers;
    }

    addQuestionField() {
        const container = document.getElementById('questionsContainer');
        const questionCount = container.querySelectorAll('.question-field').length;

        const questionHtml = `
            <div class="question-field">
                <h5>Question ${questionCount + 1}</h5>
                <div class="form-group">
                    <label>Question Text</label>
                    <input type="text" name="question${questionCount}" required>
                </div>
                <div class="form-group">
                    <label>Options</label>
                    <div class="options-container">
                        <input type="text" name="option${questionCount}_1" placeholder="Option 1" required>
                        <input type="text" name="option${questionCount}_2" placeholder="Option 2" required>
                        <input type="text" name="option${questionCount}_3" placeholder="Option 3" required>
                        <input type="text" name="option${questionCount}_4" placeholder="Option 4" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Correct Answer</label>
                    <select name="correct${questionCount}" required>
                        <option value="1">Option 1</option>
                        <option value="2">Option 2</option>
                        <option value="3">Option 3</option>
                        <option value="4">Option 4</option>
                    </select>
                </div>
                <button type="button" class="remove-question-btn">Remove Question</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', questionHtml);

        const removeBtn = container.querySelector('.question-field:last-child .remove-question-btn');
        removeBtn.addEventListener('click', () => removeBtn.parentElement.remove());
    }

    async handleQuizSubmit() {
        const form = document.getElementById('quizForm');
        const quizData = this.collectQuizData(form);

        try {
            await this.userService.createQuiz(quizData);
            this.hideQuizModal();
            this.showSuccess('Quiz created successfully!');
            this.initialize(); // Refresh quiz list
        } catch (error) {
            console.error('Failed to create quiz:', error);
            this.showError('Failed to create quiz');
        }
    }

    collectQuizData(form) {
        const questions = [];
        const questionFields = form.querySelectorAll('.question-field');

        questionFields.forEach(field => {
            const questionText = field.querySelector('input[type="text"]').value;
            const options = Array.from(field.querySelectorAll('.options-container input')).map(input => input.value);
            const correctAnswer = field.querySelector('select').value;

            questions.push({
                text: questionText,
                options: options,
                correctAnswer: parseInt(correctAnswer)
            });
        });

        return {
            title: form.quizTitle.value,
            description: form.quizDescription.value,
            questions: questions
        };
    }

    async editQuiz(quizId) {
        try {
            const quiz = await this.userService.getQuiz(quizId);
            this.showQuizModal(quiz);
        } catch (error) {
            console.error('Failed to load quiz:', error);
            this.showError('Failed to load quiz');
        }
    }

    async deleteQuiz(quizId) {
        if (confirm('Are you sure you want to delete this quiz?')) {
            try {
                await this.userService.deleteQuiz(quizId);
                this.showSuccess('Quiz deleted successfully!');
                this.initialize(); // Refresh quiz list
            } catch (error) {
                console.error('Failed to delete quiz:', error);
                this.showError('Failed to delete quiz');
            }
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.container.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }
}

export default QuizSystem; 