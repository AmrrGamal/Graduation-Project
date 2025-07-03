using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface IQuizAttemptRepository
    {
        List<QuizAttempt> GetAll();
        QuizAttempt GetById(string id);
        List<QuizAttempt> GetByStudentId(string studentId);
        void Add(QuizAttempt quizAttempt);
        void Update(QuizAttempt quizAttempt);
        void Delete(QuizAttempt quizAttempt);
        void DeleteAll();
        void IncrementTotalPointsForStudent(string studentId, int totalPoints);
    }
}
