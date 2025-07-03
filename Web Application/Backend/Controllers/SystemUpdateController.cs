using AIDentify.ID_Generator;
using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="Admin")]
    public class SystemUpdateController : ControllerBase
    {
        private readonly ISystemUpdateRepository _systemUpdateRepository;
        private readonly IdGenerator _idGenerator;

        public SystemUpdateController(ISystemUpdateRepository systemUpdateRepository, IdGenerator idGenerator)
        {
            _systemUpdateRepository = systemUpdateRepository;
            _idGenerator = idGenerator;
        }

        #region Get All
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_systemUpdateRepository.GetAllSystemUpdates());
        }
        #endregion

        #region Get by Id
        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            return Ok(_systemUpdateRepository.GetSystemUpdate(id));
        }
        #endregion

        #region Get All for this Admin
        [HttpGet("admin")]
        public IActionResult GetAllForAdmin()
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (adminIdClaim == null)
            {
                return Unauthorized("Invalid Token: User ID not found in claims");
            }
            var adminId = adminIdClaim.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return BadRequest("User ID is required");
            }

            return Ok(_systemUpdateRepository.GetAllSystemUpdateByAdminId(adminId));
        }
        #endregion

        #region Update
        [HttpPut("{id}")]
        public IActionResult UpdateSystemUpdate(string id, [FromBody] SystemUpdate systemUpdate)
        {
            var updatedSystemUpdate = _systemUpdateRepository.GetSystemUpdate(id);
            if (systemUpdate.UpdatedDescription != null && updatedSystemUpdate.UpdatedDescription != systemUpdate.UpdatedDescription)
            {
                updatedSystemUpdate.UpdatedDescription = systemUpdate.UpdatedDescription;
            }
            if (updatedSystemUpdate.UpdateType != UpdateType.None && updatedSystemUpdate.UpdateType != systemUpdate.UpdateType)
            {
                updatedSystemUpdate.UpdateType = systemUpdate.UpdateType;
            }

            _systemUpdateRepository.UpdateSystemUpdate(updatedSystemUpdate);
            return Ok("Update Successfully");
        }
        #endregion

        #region Delete
        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (adminIdClaim == null)
            {
                return Unauthorized("Invalid Token: User ID not found in claims");
            }
            var adminId = adminIdClaim.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return BadRequest("User ID is required");
            }

            var systemUpdate = _systemUpdateRepository.GetSystemUpdate(id);
            if (systemUpdate != null)
            {
                if (systemUpdate.AdminId != adminId)
                {
                    return Unauthorized("You are not authorized to delete this system update");
                }
                _systemUpdateRepository.DeleteSystemUpdate(systemUpdate);
                return Ok("Deleted Successfully");
            }
            return BadRequest("System Update Doesn't Exist");
        }
        #endregion

        #region Delete All for this Admin
        [HttpDelete("all")]
        public IActionResult DeleteAll()
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (adminIdClaim == null)
            {
                return Unauthorized("Invalid Token: User ID not found in claims");
            }
            var adminId = adminIdClaim.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return BadRequest("User ID is required");
            }

            _systemUpdateRepository.DeleteAllSystemUpdateForThisAdmin(adminId);
            return Ok("All Deleted Successfully");
        }
        #endregion
    }
}
