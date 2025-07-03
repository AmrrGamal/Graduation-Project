using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class QuizRepository: IQuizRepository
    {
        private readonly ContextAIDentify _context;

        public QuizRepository(ContextAIDentify context)
        {
            _context = context;
        }

        #region GetAll

        public List<Quiz> GetAll()
        {
            return _context.Quiz.ToList();
        }

        #endregion

        #region Get by Quiz Id

        public Quiz GetById(string id)
        {
            return _context.Quiz.Include(q => q.Questions).Include(q => q.QuizAttempts).FirstOrDefault(q => q.Id == id);
        }


        #endregion

        #region Add

        public void Add(Quiz quiz)
        {
            _context.Quiz.Add(quiz);
            _context.SaveChanges();
        }

        #endregion

        #region Deleteable

        public bool Deleteable(Quiz quiz)
        {
            var attachedQuestions = _context.Question.Where(s => s.QuizId == quiz.Id).ToList();
            if (attachedQuestions.Any())
            {
                return false;
            }
            return true;
        }

        #endregion

        #region Unattach One Question
        public void UnattachOneQuestion(Quiz quiz, string questionId)
        {
            var question = _context.Question.FirstOrDefault(q => q.Id == questionId);
            if (question != null)
            {
                question.QuizId = null;
                quiz.Questions.Remove(question);
                _context.Question.Update(question);
                _context.SaveChanges();
            }
        }
        #endregion

        #region Unattach Questions

        public void UnattachQuestions(Quiz quiz)
        {
            var attachedQuestions = _context.Question.Where(s => s.QuizId == quiz.Id).ToList();
            if (attachedQuestions.Any())
            {
                foreach (var question in attachedQuestions)
                {
                    question.QuizId = null;
                    quiz.Questions.Remove(question);
                    _context.Question.Update(question);
                }
                _context.SaveChanges();
            }
        }

        #endregion

        #region Delete

        public void Delete(Quiz quiz)
        {
            var existingQuiz = _context.Quiz.FirstOrDefault(q => q.Id == quiz.Id);
            if (existingQuiz != null)
            {
                _context.Quiz.Remove(quiz);
                _context.SaveChanges();
            }
        }

        #endregion

        #region Delete All

        public void DeleteAll()
        {
            var quizzes = _context.Quiz.ToList();
            _context.Quiz.RemoveRange(quizzes);
            _context.SaveChanges();
        }

        #endregion
    }
}
