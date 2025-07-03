using AIDentify.ID_Generator;
using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Reflection.Emit;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController: ControllerBase
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly IdGenerator _idGenerator;

        public QuestionController(IQuestionRepository questionRepository, IdGenerator idGenerator)
        {
            _questionRepository = questionRepository;
            _idGenerator = idGenerator;
        }

        #region Get All Questions

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public ActionResult<List<Question>> GetAll()
        {
            var questions = _questionRepository.GetAll();
            if (questions == null || !questions.Any())
            {
                return NotFound("No questions found.");
            }
            return Ok(questions);
        }

        #endregion

        #region Get a Specific Question by ID

        [HttpGet("{id}")]
        public ActionResult<Question> Get(string id)
        {
            var question = _questionRepository.GetById(id);
            if (question == null)
            {
                return NotFound("Question not found.");
            }
            return Ok(question);
        }

        #endregion

        #region Add a New Question

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult Add([FromBody] Question question)
        {
            if (question == null)
            {
                return BadRequest("Question cannot be null.");
            }
            question.Id = _idGenerator.GenerateId<Question>(ModelPrefix.Question);
            _questionRepository.Add(question);
            return Ok("Posted Successfully.");
        }

        #endregion

        #region Update a Question

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult Update(string id, [FromBody] Question question)
        {
            if (question == null)
            {
                return BadRequest("Question cannot be null.");
            }
            if(question.TheQuestion == string.Empty)
            {
                return BadRequest("Question cannot be empty.");
            }
            if(question.CorrectAnswer == string.Empty)
            {
                return BadRequest("Answer cannot be empty.");
            }
            if (question.Options == null || question.Options.Count == 0)
            {
                return BadRequest("Options cannot be empty.");
            }

            question.Id = id;
            var existingQuestion = _questionRepository.GetById(id);
            if (existingQuestion == null)
            {
                return NotFound("Question not found.");
            }
            question.QuizId = existingQuestion.QuizId;
            existingQuestion = question;
            _questionRepository.Update(existingQuestion);
            return Ok("Updated Successfully.");
        }

        #endregion

        #region Delete a Question

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult Delete(string id)
        {
            var question = _questionRepository.GetById(id);
            if (question == null)
            {
                return NotFound("Question not found.");
            }
            _questionRepository.Delete(question);
            return Ok("Deleted Successfully.");
        }

        #endregion
    }
}
