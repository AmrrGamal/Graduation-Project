using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class QuestionRepository: IQuestionRepository
    {
        private readonly ContextAIDentify _context;

        public QuestionRepository (ContextAIDentify context)
        {
            _context = context;
        }

        #region GetAll

        public List<Question> GetAll()
        {
            return _context.Question.ToList();
        }

        #endregion

        #region Get by Quiz Id

        public Question GetById(string id)
        {
            return _context.Question.FirstOrDefault(q => q.Id == id);
        }

        #endregion

        #region Add

        public void Add(Question question)
        {
            _context.Question.Add(question);
            _context.SaveChanges();
        }

        #endregion

        #region Add Question to a Specific Quiz

        public void AddQuestionToQuiz(string quizId, string questionId)
        {
            var quiz = _context.Quiz.FirstOrDefault(q => q.Id == quizId);
            var question = _context.Question.FirstOrDefault(q => q.Id == questionId);
            if (quiz != null && question != null)
            {
                question.QuizId = quizId;
                _context.Question.Update(question);
                _context.SaveChanges();
            }
        }

        #endregion

        #region Update

        public void Update(Question question)
        {
            var existingQuestion = _context.Question.FirstOrDefault(q => q.Id == question.Id);
            if (existingQuestion != null)
            {
                _context.Entry(existingQuestion).CurrentValues.SetValues(question);
                _context.SaveChanges();
            }
        }


        #endregion

        #region Delete

        public void Delete(Question question)
        {
            var existingQuestion = _context.Question.FirstOrDefault(q => q.Id == question.Id);
            if (existingQuestion != null)
            {
                _context.Question.Remove(question);
                _context.SaveChanges();
            }           
        }

        #endregion

        #region DeleteAll

        public void DeleteAll()
        {
            var questions = _context.Question.ToList();
            _context.Question.RemoveRange(questions);
            _context.SaveChanges();
        }

        #endregion

        #region Find by Quiz Id

        public List<Question> FindByQuizId(string quizId)
        {
            return _context.Question.Where(q => q.QuizId == quizId).ToList();
        }

        #endregion
    }
}
