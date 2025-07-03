using AIDentify.Models;
using AIDentify.Models.Enums;

namespace AIDentify.IRepositry
{
    public interface IPaymentRepository
    {
        List<Payment> GetAll(string userId);
        Payment? Get(string userId, string id);
        void Add(string userId, Payment payment);   // User makes a payment request
        void Update(string userId, Payment payment);
        void Delete(string userId, Payment payment);
        IEnumerable<Payment> GetPendingPayments();  // Get all pending payments for admin
        void UpdateStatus(string paymentId, PaymentStatus status);  // Admin approval/rejection
    }
}
