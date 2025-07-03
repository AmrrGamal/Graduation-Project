using AIDentify.Models;

namespace AIDentify.DTO
{
    public class SubscriptionPaymentDto
    {
        public Subscription? Subscription { get; set; } = null;
        public Payment? Payment { get; set; } = null;
    }
}
