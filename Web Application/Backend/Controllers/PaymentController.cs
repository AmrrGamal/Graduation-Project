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
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly ISubscriptionRepository _subscriptionRepository;
        private readonly ISystemUpdateRepository _systemUpdateRepository;
        private readonly IdGenerator _idGenerator;
        private UpdateType updateTypePayment = UpdateType.Payment;


        public PaymentController(IPaymentRepository paymentRepository, ISubscriptionRepository subscriptionRepository, IdGenerator idGenerator, ISystemUpdateRepository systemUpdateRepository)
        {
            _paymentRepository = paymentRepository;
            _subscriptionRepository = subscriptionRepository;
            _idGenerator = idGenerator;
            _systemUpdateRepository = systemUpdateRepository;
        }

        #region Get All Payments for this User

        [HttpGet]
        [Authorize]
        public ActionResult<List<Payment>> GetAll()
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

            var payments = _paymentRepository.GetAll(userId);
            if (payments == null || !payments.Any())
            {
                return NotFound("No payments found for this user.");
            }
            return Ok(payments);
        }

        #endregion

        #region Get a Specific Payment by ID for this User

        [HttpGet("{id}")]
        [Authorize]
        public ActionResult<Payment> Get(string id)
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

            var payment = _paymentRepository.Get(userId, id);
            if (payment == null)
            {
                return NotFound("Payment not found.");
            }
            return Ok(payment);
        }

        #endregion

        #region Update an Existing Payment for this User

        [HttpPut("{id}")]
        [Authorize]
        public ActionResult Update(string id, [FromBody] Payment payment)
        {
            try
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

                // Find the existing payment
                var existingPayment = _paymentRepository.Get(userId, id);
                if (existingPayment == null)
                {
                    return NotFound("Payment not found.");
                }

                // Update payment details
                if (payment.WayOfPayment != WayOfPayment.None)
                {
                    existingPayment.WayOfPayment = payment.WayOfPayment;
                }
                if (payment.Amount != -1)
                {
                    existingPayment.Amount = payment.Amount;
                }
                existingPayment.PaymentDate = DateTime.Now;


                _paymentRepository.Update(userId, existingPayment);

                // Retrieve and update subscription if necessary
                var subscription = _subscriptionRepository.GetSubscriptionByUserId(userId);
                if (subscription != null)
                {
                    subscription.StartDate = existingPayment.PaymentDate;

                    var plan = subscription.Plan;
                    int duration = plan?.Duration ?? 0;

                    subscription.EndDate = subscription.StartDate.AddMonths(duration);
                    subscription.IsPaid = true;

                    _subscriptionRepository.UpdateSubscription(subscription);
                }

                return Ok("Payment updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        #endregion

        #region Delete a Payment for this User

        [HttpDelete("{paymentId}")]
        [Authorize]
        public ActionResult Delete(string paymentId)
        {
            try
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

                // Find the existing payment
                var payment = _paymentRepository.Get(userId, paymentId);
                if (payment == null)
                {
                    return NotFound("Payment not found.");
                }

                // Delete the payment
                _paymentRepository.Delete(userId, payment);

                // Retrieve subscription related to the user
                var subscription = _subscriptionRepository.GetSubscriptionByUserId(userId);
                if (subscription != null)
                {
                    // If the payment was the most recent one, adjust the subscription
                    var latestPayment = _paymentRepository.GetAll(userId)?.OrderByDescending(p => p.PaymentDate).FirstOrDefault();

                    if (latestPayment != null)
                    {
                        subscription.StartDate = latestPayment.PaymentDate;
                        var plan = subscription.Plan;
                        int duration = plan?.Duration ?? 0;
                        subscription.EndDate = subscription.StartDate.AddMonths(duration);
                    }
                    else
                    {
                        // No payments left → Subscription is unpaid
                        subscription.IsPaid = false;
                    }

                    _subscriptionRepository.UpdateSubscription(subscription);
                }

                return Ok("Payment deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        #endregion

        #region Admin fetches all pending payments

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetPendingPayments()
        {
            var pendingPayments = _paymentRepository.GetPendingPayments();
            return Ok(pendingPayments);
        }

        #endregion

        #region Admin approves or rejects a payment

        [HttpPut("update-status/{paymentId}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdatePaymentStatus(string paymentId, [FromBody] string status)
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

            if (string.IsNullOrEmpty(status))
            {
                return BadRequest("You have to enter a status.");
            }



            if (Enum.TryParse(status, true, out PaymentStatus parsedStatus))
            {
                var payment = _paymentRepository.GetPendingPayments().FirstOrDefault(p => p.Id == paymentId);

                if (payment == null)
                    return NotFound("Pending payment not found.");

                var subscription = _subscriptionRepository.GetSubscriptionByUserId(payment.DoctorId ?? payment.StudentId);

                if (payment.Status == PaymentStatus.Completed)
                    return BadRequest("Cannot update a completed payment.");

                if (parsedStatus == PaymentStatus.Completed)
                {
                    subscription.IsPaid = true;
                }

                SystemUpdate systemUpdate = new SystemUpdate
                {
                    Id = _idGenerator.GenerateId<SystemUpdate>(ModelPrefix.SystemUpdate),
                    UpdatedDescription = "Payment: " + paymentId + " was updated to be " + parsedStatus,
                    UpdateType = updateTypePayment,
                    AdminId = adminId
                };

                _systemUpdateRepository.AddSystemUpdate(adminId, systemUpdate);
                _subscriptionRepository.UpdateSubscription(subscription);
                _paymentRepository.UpdateStatus(paymentId, parsedStatus);
                return Ok($"Payment {paymentId} updated to {parsedStatus}");
            }

            return BadRequest("Please write 'Pending', 'Completed', or 'Failed'.");
        }

        #endregion

    }
}
