using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface INotificationRepository
    {
        List<Notification?> GetAllNotifications();
        List<Notification?> GetNotificationsByUserId(string userId);
        Notification? GetNotification(string id);
        void AddNotification(Notification notification, string userId);
        void MarkAsSeen(string id);
        void UpdateNotification(Notification notification);
        void DeleteNotification(Notification notification);
        void DeleteAllNotificationsByUserId(string userId);
    }
}
