using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface ISubscriptionRepository
    {
        List<Subscription> GetAllSubscriptions();
        Subscription? GetSubscription(string id);
        void AddSubscription(Subscription subscription, string userId);
        void UpdateSubscription(Subscription subscription);
        long DealWithPlanPriceDifference(Subscription subscription, string newPlanId);
        void DeleteSubscription(Subscription subscription);
        void Delete(Subscription subscription);
        Subscription? GetSubscriptionByUserId(string userId);

    }
}
