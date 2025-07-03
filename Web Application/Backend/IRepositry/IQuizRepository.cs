using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface IQuizRepository
    {
        List<Quiz> GetAll();
        Quiz GetById(string id);
        void Add(Quiz quiz);
        bool Deleteable(Quiz quiz);
        void UnattachOneQuestion(Quiz quiz, string questionId);
        void UnattachQuestions(Quiz quiz);
        void Delete(Quiz quiz);
        void DeleteAll();
    }
}
