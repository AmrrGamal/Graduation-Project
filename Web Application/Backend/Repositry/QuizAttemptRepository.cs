using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Context;

namespace AIDentify.Repositry
{
    public class QuizAttemptRepository : IQuizAttemptRepository
    {
        private readonly ContextAIDentify _context;

        public QuizAttemptRepository(ContextAIDentify context)
        {
            _context = context;
        }

        #region GetAll

        public List<QuizAttempt> GetAll()
        {
            return _context.QuizAttempt.ToList();
        }

        #endregion

        #region Get by Quiz Id

        public QuizAttempt GetById(string id)
        {
            return _context.QuizAttempt.FirstOrDefault(q => q.Id == id);
        }

        #endregion

        #region Get by Student Id
        public List<QuizAttempt> GetByStudentId(string studentId)
        {
            return _context.QuizAttempt.Where(q => q.StudentId == studentId).ToList();
        }
        #endregion

        #region Add
        public void Add(QuizAttempt quizAttempt)
        {
            var student = _context.Student.FirstOrDefault(s => s.Student_ID == quizAttempt.StudentId);
            if (student != null)
            {
                student.QuizAttempts.Add(quizAttempt);
            }
            _context.QuizAttempt.Add(quizAttempt);
            _context.Student.Update(student);
            _context.SaveChanges();
        }

        #endregion

        #region Update

        public void Update(QuizAttempt quizAttempt)
        {
            var existingQuizAttempt = _context.QuizAttempt.FirstOrDefault(q => q.Id == quizAttempt.Id);
            if (existingQuizAttempt != null)
            {
                _context.QuizAttempt.Update(quizAttempt);
                _context.SaveChanges();
            }
        }

        #endregion

        #region Delete
        public void Delete(QuizAttempt quizAttempt)
        {
            var existingQuizAttempt = _context.QuizAttempt.FirstOrDefault(q => q.Id == quizAttempt.Id);
            if (existingQuizAttempt != null)
            {
                _context.QuizAttempt.Remove(quizAttempt);
                _context.SaveChanges();
            }
        }

        #endregion

        #region DeleteAll

        public void DeleteAll()
        {
            var quizAttempts = _context.QuizAttempt.ToList();
            _context.QuizAttempt.RemoveRange(quizAttempts);
            _context.SaveChanges();
        }

        #endregion

        #region Increment Score for Student

        public void IncrementTotalPointsForStudent(string studentId, int totalPoints)
        {
            var student = _context.Student.FirstOrDefault(s => s.Student_ID == studentId);
            if (student != null)
            {
                long currentPoints = student.TotalPOintsEarned ?? 0;
                currentPoints += totalPoints;
                student.TotalPOintsEarned = currentPoints;
                _context.Student.Update(student);
                _context.SaveChanges();
            }
        }

        #endregion
    }
}
