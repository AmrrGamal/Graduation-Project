using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ContextAIDentify _context;

        public PaymentRepository(ContextAIDentify context)
        {
            _context = context;
        }

        #region GetAll by User Id

        public List<Payment>? GetAll(string userId)
        {
            var doctor = _context.Doctor.FirstOrDefault(d => d.Doctor_ID == userId);
            if (doctor != null)
            {
                return _context.Payment.Where(p => p.DoctorId == userId).Include(p => p.Doctor).ToList();
            }

            var student = _context.Student.FirstOrDefault(s => s.Student_ID == userId);
            if (student != null)
            {
                return _context.Payment.Where(p => p.StudentId == userId).Include(p => p.Student).ToList();
            }

            return null;
        }

        #endregion

        #region Get One Payment by User Id and Payment Id
        public Payment? Get(string userId, string id)
        {
            var doctor = _context.Doctor.FirstOrDefault(d => d.Doctor_ID == userId);
            if (doctor != null)
            {
                return _context.Payment.Include(p => p.Doctor)
                                       .FirstOrDefault(p => p.DoctorId == userId && p.Id == id);
            }

            var student = _context.Student.FirstOrDefault(s => s.Student_ID == userId);
            if (student != null)
            {
                return _context.Payment.Include(p => p.Student)
                                       .FirstOrDefault(p => p.StudentId == userId && p.Id == id);
            }

            return null;
        }

        #endregion

        #region Add Payment to a Specific User
        public void Add(string userId, Payment payment)
        {
            // Assign the current date to the payment
            payment.PaymentDate = DateTime.Now;

            // Check if the user is a doctor
            var doctor = _context.Doctor.FirstOrDefault(d => d.Doctor_ID == userId);
            if (doctor != null)
            {
                payment.DoctorId = userId;
                payment.StudentId = null; // Ensure it's not mistakenly assigned
                _context.Payment.Add(payment);
                _context.SaveChanges();
                return;
            }

            // Check if the user is a student
            var student = _context.Student.FirstOrDefault(s => s.Student_ID == userId);
            if (student != null)
            {
                payment.StudentId = userId;
                payment.DoctorId = null; // Ensure it's not mistakenly assigned
                _context.Payment.Add(payment);
                _context.SaveChanges();
                return;
            }

            // If the user is neither a doctor nor a student, throw an exception
            throw new Exception("User not found.");
        }

        #endregion

        #region Update an existing Payment for a specific user

        public void Update(string userId, Payment payment)
        {
            var existingPayment = _context.Payment.FirstOrDefault(p => p.Id == payment.Id);
            if (existingPayment == null)
            {
                throw new Exception("Payment not found.");
            }

            // Check if the user is a doctor
            if (_context.Doctor.Any(d => d.Doctor_ID == userId))
            {
                if (existingPayment.DoctorId != userId)
                {
                    throw new Exception("Unauthorized: You can only update your own payments.");
                }
                existingPayment.Amount = payment.Amount;
                existingPayment.PaymentDate = payment.PaymentDate;
                existingPayment.WayOfPayment = payment.WayOfPayment;
            }
            // Check if the user is a student
            else if (_context.Student.Any(s => s.Student_ID == userId))
            {
                if (existingPayment.StudentId != userId)
                {
                    throw new Exception("Unauthorized: You can only update your own payments.");
                }
                existingPayment.Amount = payment.Amount;
                existingPayment.PaymentDate = payment.PaymentDate;
                existingPayment.WayOfPayment = payment.WayOfPayment;
            }
            else
            {
                throw new Exception("User not found.");
            }

            _context.SaveChanges();
        }

        #endregion

        #region Delete an existing Payment for a specific user

        public void Delete(string userId, Payment payment)
        {
            var existingPayment = _context.Payment.FirstOrDefault(p => p.Id == payment.Id);
            if (existingPayment == null)
            {
                throw new Exception("Payment not found.");
            }

            // Check if the user is a doctor
            if (_context.Doctor.Any(d => d.Doctor_ID == userId))
            {
                if (existingPayment.DoctorId != userId)
                {
                    throw new Exception("Unauthorized: You can only delete your own payments.");
                }
            }
            // Check if the user is a student
            else if (_context.Student.Any(s => s.Student_ID == userId))
            {
                if (existingPayment.StudentId != userId)
                {
                    throw new Exception("Unauthorized: You can only delete your own payments.");
                }
            }
            else
            {
                throw new Exception("User not found.");
            }

            _context.Payment.Remove(existingPayment);
            _context.SaveChanges();
        }

        #endregion

        #region Get all pending payments (for admin review)
        
        public IEnumerable<Payment> GetPendingPayments()
        {
            return _context.Payment.Where(p => p.Status == PaymentStatus.Pending).ToList();
        }

        #endregion

        #region Admin approves or rejects a payment
        public void UpdateStatus(string paymentId, PaymentStatus status)
        {
            var payment = _context.Payment.FirstOrDefault(p => p.Id == paymentId);
            if (payment != null)
            {
                payment.Status = status;
                _context.SaveChanges();
            }
        }

        #endregion
    }
}
