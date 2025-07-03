import ApiService from './ApiService.js';

class QuizService {
    constructor() {
        this.apiService = new ApiService();
        this.baseUrl = 'http://aidentify-gradutionff.runasp.net/api';
    }

    async createQuestion(questionData) {
        try {
            const response = await fetch(`${this.baseUrl}/question/create-question`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(questionData)
            });

            if (!response.ok) {
                throw new Error('Failed to create question');
            }

            return await response.json();
        } catch (error) {
            console.error('Create question error:', error);
            throw error;
        }
    }

    async getAllQuestions() {
        try {
            const response = await fetch(`${this.baseUrl}/question/get-all-questions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get questions');
            }

            return await response.json();
        } catch (error) {
            console.error('Get questions error:', error);
            throw error;
        }
    }

    async getQuestionById(questionId) {
        try {
            const response = await fetch(`${this.baseUrl}/question/get-question-by-id/${questionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get question');
            }

            return await response.json();
        } catch (error) {
            console.error('Get question error:', error);
            throw error;
        }
    }

    async updateQuestion(questionId, questionData) {
        try {
            const response = await fetch(`${this.baseUrl}/question/update-question`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    id: questionId,
                    ...questionData
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update question');
            }

            return await response.json();
        } catch (error) {
            console.error('Update question error:', error);
            throw error;
        }
    }

    async deleteQuestion(questionId) {
        try {
            const response = await fetch(`${this.baseUrl}/question/delete-question`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ id: questionId })
            });

            if (!response.ok) {
                throw new Error('Failed to delete question');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete question error:', error);
            throw error;
        }
    }

    async createQuizQuestionsNew(quizData) {
        try {
            const response = await fetch(`${this.baseUrl}/quiz/create-quiz-questions-new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(quizData)
            });

            if (!response.ok) {
                throw new Error('Failed to create quiz');
            }

            return await response.json();
        } catch (error) {
            console.error('Create quiz error:', error);
            throw error;
        }
    }

    async createQuizQuestionsExisting(quizData) {
        try {
            const response = await fetch(`${this.baseUrl}/quiz/create-quiz-questions-existing`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(quizData)
            });

            if (!response.ok) {
                throw new Error('Failed to create quiz from existing questions');
            }

            return await response.json();
        } catch (error) {
            console.error('Create quiz from existing questions error:', error);
            throw error;
        }
    }

    async startQuizAttempt(quizId) {
        try {
            const response = await fetch(`${this.baseUrl}/quiz-attempt/start-quiz-attempt`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ quizId })
            });

            if (!response.ok) {
                throw new Error('Failed to start quiz attempt');
            }

            return await response.json();
        } catch (error) {
            console.error('Start quiz attempt error:', error);
            throw error;
        }
    }

    async getAllAttempts() {
        try {
            const response = await fetch(`${this.baseUrl}/quiz-attempt/get-all-attempts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get quiz attempts');
            }

            return await response.json();
        } catch (error) {
            console.error('Get quiz attempts error:', error);
            throw error;
        }
    }

    async getAttemptById(attemptId) {
        try {
            const response = await fetch(`${this.baseUrl}/quiz-attempt/get-attempt-by-id/${attemptId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get quiz attempt');
            }

            return await response.json();
        } catch (error) {
            console.error('Get quiz attempt error:', error);
            throw error;
        }
    }

    async deleteAttempt(attemptId) {
        try {
            const response = await fetch(`${this.baseUrl}/quiz-attempt/delete-attempt`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ id: attemptId })
            });

            if (!response.ok) {
                throw new Error('Failed to delete quiz attempt');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete quiz attempt error:', error);
            throw error;
        }
    }
}

export default QuizService; 