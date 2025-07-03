using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface IQuestionRepository
    {
        List<Question> GetAll();
        Question GetById(string id);
        void Add(Question question);
        void AddQuestionToQuiz(string quizId, string questionId);
        void Update(Question question);
        void Delete(Question question);
        void DeleteAll();
        List<Question> FindByQuizId(string quizId);
    }
}
