using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ContextAIDentify _context;

        public NotificationRepository(ContextAIDentify context)
        {
            _context = context;
        }

        #region Get All Notifications
        public List<Notification> GetAllNotifications()
        {
            return _context.Notification.Include(n => n.Doctor).Include(n => n.Student).ToList();
        }
        #endregion

        #region Get Notifications by User Id
        public List<Notification> GetNotificationsByUserId(string userId)
        {
            return _context.Notification
                .Where(n => n.DoctorId == userId || n.StudentId == userId)
                .Include(n => n.Doctor)
                .Include(n => n.Student)
                .ToList();
        }
        #endregion

        #region Get Notification by Id
        public Notification GetNotification(string id)
        {
            return _context.Notification
                .Include(n => n.Doctor)
                .Include(n => n.Student)
                .FirstOrDefault(n => n.Id == id);
        }
        #endregion

        #region Add Notification
        public void AddNotification(Notification notification, string userId)
        {
            var doctor = _context.Doctor.FirstOrDefault(d => d.Doctor_ID == userId);
            var student = _context.Student.FirstOrDefault(s => s.Student_ID == userId);
            if (doctor != null)
            {
                notification.DoctorId = userId;
                doctor.Notifications.Add(notification);
            }
            else if (student!= null)
            {
                notification.StudentId = userId;
                student.Notifications.Add(notification);
            }
            else
            {
                throw new Exception("User not found.");
            }

            _context.Notification.Add(notification);
            _context.SaveChanges();
        }
        #endregion

        #region Mark Notification as Seen
        public void MarkAsSeen(string notificationId)
        {
            var notification = _context.Notification.FirstOrDefault(n => n.Id == notificationId);
            if (notification != null)
            {
                notification.Status = NotificationStatus.seen;
                _context.SaveChanges();
            }
        }
        #endregion

        #region Update Notification
        public void UpdateNotification(Notification notification)
        {
            if (notification == null) throw new ArgumentNullException(nameof(notification));

            var oldNotification = _context.Notification.FirstOrDefault(n => n.Id == notification.Id);
            if (oldNotification != null)
            {
                notification.SentAt = oldNotification.SentAt; // Preserve the original sent time
                notification.StudentId = oldNotification.StudentId; // Preserve the original user ID
                notification.DoctorId = oldNotification.DoctorId; // Preserve the original user ID
                
                // Update the existing notification with new values
                _context.Entry(oldNotification).CurrentValues.SetValues(notification);
                _context.SaveChanges();
            }
        }
        #endregion

        #region Delete Notification
        public void DeleteNotification(Notification notification)
        {
            if (notification == null) throw new ArgumentNullException(nameof(notification));
            _context.Notification.Remove(notification);
            _context.SaveChanges();
        }
        #endregion

        #region Delete All Notifications for a User
        public void DeleteAllNotificationsByUserId(string userId)
        {
            if (string.IsNullOrEmpty(userId)) throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            var notifications = _context.Notification
                .Where(n => n.DoctorId == userId || n.StudentId == userId)
                .ToList();
            if (notifications.Any())
            {
                _context.Notification.RemoveRange(notifications);
                _context.SaveChanges();
            }
        }
        #endregion
    }
}
