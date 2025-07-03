using AIDentify.ID_Generator;
using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizAttemptController: ControllerBase
    {
        private readonly IQuizAttemptRepository _quizAttemptRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IdGenerator _idGenerator;

        public QuizAttemptController(IQuizAttemptRepository quizAttemptRepository, IdGenerator idGenerator, IQuizRepository quizRepository, IQuestionRepository questionRepository)
        {
            _quizAttemptRepository = quizAttemptRepository;
            _questionRepository = questionRepository;
            _quizRepository = quizRepository;
            _idGenerator = idGenerator;
        }

        #region Normal CRUD Methods

        #region Get All Quiz Attempts

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public ActionResult<List<QuizAttempt>> GetAll()
        {
            var quizAttempts = _quizAttemptRepository.GetAll();
            if (quizAttempts == null || !quizAttempts.Any())
            {
                return NotFound("No quiz attempts found.");
            }
            return Ok(quizAttempts);
        }

        #endregion
        
        #region Get Quiz Attempt by ID
        
        [HttpGet("{id}")]
        public ActionResult<QuizAttempt> Get(string id)
        {
            var quizAttempt = _quizAttemptRepository.GetById(id);
            if (quizAttempt == null)
            {
                return NotFound("Quiz attempt not found.");
            }
            return Ok(quizAttempt);
        }

        #endregion

        #region Get Quiz Attempts by Student ID
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public ActionResult<List<QuizAttempt>> GetAllMyAttempts()
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (studentIdClaim == null)
            {
                return Unauthorized("Invalid Token: User ID not found in claims");
            }
            var studentId = studentIdClaim.Value;
            if (string.IsNullOrEmpty(studentId))
            {
                return BadRequest("User ID is required");
            }

            var quizAttempts = _quizAttemptRepository.GetByStudentId(studentId);
            if (quizAttempts == null || !quizAttempts.Any())
            {
                return NotFound("No quiz attempts found for the specified student.");
            }
            return Ok(quizAttempts);
        }
        #endregion

        #region Delete Quiz Attempt

        [HttpDelete("{id}")]
        [Authorize(Roles = "Student")]
        public IActionResult Delete(string id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("Invalid Token: User ID not found in claims");
            }
            var userId = userIdClaim.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            var existingQuizAttempt = _quizAttemptRepository.GetById(id);
            if (existingQuizAttempt == null)
            {
                return NotFound("Quiz attempt not found.");
            }

            if (existingQuizAttempt.StudentId != userId)
            {
                return Forbid("You are not authorized to delete this quiz attempt.");
            }

            _quizAttemptRepository.Delete(existingQuizAttempt);
            return Ok("Deleted Successfully");
        }

        #endregion

        #endregion

        #region Custom Methods

        #region Start a Quiz Attempts by Student ID

        [HttpPost("start/{quizId}")]
        public IActionResult StartQuiz(string quizId, [FromBody] List<string> answers)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (studentIdClaim == null)
            {
                return Unauthorized("Invalid Token: User ID not found in claims");
            }
            var studentId = studentIdClaim.Value;
            if (string.IsNullOrEmpty(studentId))
            {
                return BadRequest("User ID is required");
            }

            var quiz = _quizRepository.GetById(quizId);
            if (quiz == null)
            {
                return BadRequest("There is no such a quiz.");
            }

            if (answers == null || !answers.Any())
            {
                return BadRequest("Answers cannot be null or empty.");
            }

            int points = 0;
            List<Question> questions = _questionRepository.FindByQuizId(quizId);

            for(int i = 0; i < questions.Count; i++)
            {
                if (answers[i] == questions[i].CorrectAnswer)
                {
                    points++;
                }
            }

            var quizAttempt = new QuizAttempt
            {
                Id = _idGenerator.GenerateId<QuizAttempt>(ModelPrefix.QuizAttempt),
                StudentId = studentId,
                QuizId = quizId,
                SelectedAnswers = answers,
                PointsEarned = points
            };

            // Increment total points for the student
            _quizAttemptRepository.IncrementTotalPointsForStudent(studentId, points);   // Unfinished method in repository

            _quizAttemptRepository.Add(quizAttempt);
            return Ok("Quiz attempt started successfully." + " Your points: " + points);
        }

        #endregion

        #endregion
    }
}
