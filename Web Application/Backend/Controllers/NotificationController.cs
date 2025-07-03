using AIDentify.ID_Generator;
using AIDentify.IRepositry;
using AIDentify.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IdGenerator _idGenerator;

        public NotificationController(INotificationRepository notificationRepository, IdGenerator idGenerator)
        {
            _notificationRepository = notificationRepository;
            _idGenerator = idGenerator;
        }

        #region Get All Notifications
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public ActionResult<List<Notification?>> GetAllNotifications()
        {
            return Ok(_notificationRepository.GetAllNotifications());
        }
        #endregion

        #region Get Notifications by User Id
        [HttpGet("byUser")]
        [Authorize]
        public ActionResult<List<Notification?>> GetNotificationsByUserId()
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

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID cannot be null or empty.");
            }
            return Ok(_notificationRepository.GetNotificationsByUserId(userId));
        }
        #endregion

        #region Get Notification by Id
        [HttpGet("notification/{id}")]
        [Authorize]
        public ActionResult<Notification?> GetNotification(string id)
        {
            var notification = _notificationRepository.GetNotification(id);
            if (notification == null)
            {
                return NotFound();
            }
            return Ok(notification);
        }
        #endregion

        #region Add Notification
        [HttpPost("{userId}")]
        [Authorize(Roles = "Admin")]
        public ActionResult AddNotification([FromBody] string notificationContent, string userId)
        {
            Notification notification = new Notification
            {
                Id = _idGenerator.GenerateId<Notification>(ModelPrefix.Notification),
                NotificationContent = notificationContent,
                SentAt = DateTime.UtcNow
            };

            _notificationRepository.AddNotification(notification, userId);
            return Ok("Created Successfully");
        }
        #endregion

        #region Mark Notification as Seen
        [HttpPut("seen/{id}")]
        [Authorize]
        public ActionResult MarkNotificationAsSeen(string id)
        {
            var notification = _notificationRepository.GetNotification(id);
            if (notification == null)
            {
                return NotFound();
            }
            _notificationRepository.MarkAsSeen(id);
            return Ok("Marked as Seen Successfully");
        }
        #endregion

        #region Update Notification
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult UpdateNotification([FromBody] string notificationNewContent, string id)
        {
            Notification notification = new Notification
            {
                Id = id,
                NotificationContent = notificationNewContent,
            };
            _notificationRepository.UpdateNotification(notification);
            return Ok("Updated Successfully");
        }
        #endregion

        #region Delete Notification by Id
        [HttpDelete("{id}")]
        [Authorize]
        public ActionResult DeleteNotification(string id)
        {
            var notification = _notificationRepository.GetNotification(id);
            if (notification == null)
            {
                return NotFound();
            }
            _notificationRepository.DeleteNotification(notification);
            return Ok("Deleted Successfully");
        }
        #endregion

        #region Delete All Notifications for a User
        [HttpDelete]
        [Authorize]
        public ActionResult DeleteAllNotificationsByUserId()
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

            _notificationRepository.DeleteAllNotificationsByUserId(userId);
            return Ok("All Deleted Successfully");
        }
        #endregion
    }
}
