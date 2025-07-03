using AIDentify.ID_Generator;
using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizRepository _quizRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IdGenerator _idGenerator;

        public QuizController(IQuizRepository quizRepository, IdGenerator idGenerator, IQuestionRepository questionRepository)
        {
            _quizRepository = quizRepository;
            _idGenerator = idGenerator;
            _questionRepository = questionRepository;
        }

        #region Normal CRUD Methods

        #region Get All Quizzes

        [HttpGet]
        public IActionResult GetAll()
        {
            var quizzes = _quizRepository.GetAll();
            if (quizzes == null || !quizzes.Any())
            {
                return NotFound("No quizzes found.");
            }
            return Ok(quizzes);
        }

        #endregion

        #region Get Quiz by ID

        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            var quiz = _quizRepository.GetById(id);
            if (quiz == null)
            {
                return NotFound("Quiz not found.");
            }
            return Ok(quiz);
        }

        #endregion

        #region Add New Quiz

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult Add([FromBody] Quiz quiz)
        {
            if (quiz == null)
            {
                return BadRequest("Quiz cannot be null.");
            }

            quiz.Id = _idGenerator.GenerateId<Quiz>(ModelPrefix.Quiz);

            _quizRepository.Add(quiz);
            return Ok("Posted Successfully");
        }

        #endregion

        #region Delete Quiz

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Delete(string id)
        {
            var quiz = _quizRepository.GetById(id);
            if (quiz == null)
            {
                return NotFound("Quiz not found.");
            }
            if (_quizRepository.Deleteable(quiz))
            {
                _quizRepository.Delete(quiz);
                return Ok("Deleted Successfully");
            }
            _quizRepository.UnattachQuestions(quiz);
            _quizRepository.Delete(quiz);
            return Ok("Deleted Successfully");
        }

        #endregion

        #endregion

        #region Quizzes with Questions Methods

        #region Create Questions for a new Quiz

        [HttpPost("new/questions")]
        [Authorize(Roles = "Admin")]
        public IActionResult AddQuestionsToNewQuiz([FromBody] List<Question> questions)
        {
            if (questions == null || !questions.Any())
            {
                return BadRequest("Quiz must have at least one question.");
            }

            Quiz quiz = new Quiz{
                Id = _idGenerator.GenerateId<Quiz>(ModelPrefix.Quiz),
            };

            _quizRepository.Add(quiz);

            foreach (var question in questions)
            {
                question.Id = _idGenerator.GenerateId<Question>(ModelPrefix.Question);
                _questionRepository.Add(question);
                _questionRepository.AddQuestionToQuiz(quiz.Id, question.Id);
                quiz.Questions.Add(question);
            }

            return Ok("Posted Successfully");
        }

        #endregion

        #region Create Questions to an Existing Quiz

        [HttpPost("{id}/questions")]
        [Authorize(Roles = "Admin")]
        public IActionResult AddQuestionsToExistingQuiz(string id, [FromBody] List<Question> questions)
        {
            if (questions == null || !questions.Any())
            {
                return BadRequest("Questions cannot be null or empty.");
            }

            var quiz = _quizRepository.GetById(id);
            if (quiz == null)
            {
                return NotFound("Quiz not found.");
            }

            foreach (var question in questions)
            {
                question.Id = _idGenerator.GenerateId<Question>(ModelPrefix.Question);
                _questionRepository.Add(question);
                _questionRepository.AddQuestionToQuiz(quiz.Id, question.Id);
                quiz.Questions.Add(question);
            }

            return Ok("Questions added successfully.");
        }

        #endregion

        #region Add an Existing Question to an Existing Quiz

        [HttpPost("{quizId}/questions/{questionId}")]
        [Authorize(Roles = "Admin")]
        public IActionResult AddExistingQuestionToQuiz(string quizId, string questionId)
        {
            var quiz = _quizRepository.GetById(quizId);
            if (quiz == null)
            {
                return NotFound("Quiz not found.");
            }
            var question = _questionRepository.GetById(questionId);
            if (question == null)
            {
                return NotFound("Question not found.");
            }
            _questionRepository.AddQuestionToQuiz(quiz.Id, question.Id);
            quiz.Questions.Add(question);
            return Ok("Question added to quiz successfully.");
        }

        #endregion

        #region Remove Question from Quiz
        [HttpDelete("{quizId}/questions/{questionId}")]
        [Authorize(Roles = "Admin")]
        public IActionResult RemoveQuestionFromQuiz(string quizId, string questionId)
        {
            var quiz = _quizRepository.GetById(quizId);
            if (quiz == null)
            {
                return NotFound("Quiz not found.");
            }
            var question = _questionRepository.GetById(questionId);
            if (question == null)
            {
                return NotFound("Question not found.");
            }
            _quizRepository.UnattachOneQuestion(quiz, question.Id);
            quiz.Questions.Remove(question);
            return Ok("Question removed from quiz successfully.");
        }
        #endregion

        #endregion
    }
}
