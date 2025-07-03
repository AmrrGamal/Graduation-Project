using AIDentify.Models.Context;
using AIDentify.Models.Enums;

namespace AIDentify.Service
{
    using AIDentify.ID_Generator;
    using AIDentify.Models;
    using Microsoft.Extensions.Hosting;
    using System;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    public class SubscriptionExpirationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public SubscriptionExpirationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<ContextAIDentify>();
 
                        // Get subscriptions that need to be updated
                        var subscriptions = dbContext.Subscription.ToList();

                        var expiredSubscriptions = dbContext.Subscription
                        .Where(s => s.EndDate < DateTime.UtcNow && s.Status == SubscriptionStatus.Active)
                        .ToList();

                        var tobeActivatedSubscriptions = dbContext.Subscription.Where(s => s.IsPaid == true && s.EndDate < DateTime.Now).ToList();

                        if (subscriptions.Any())
                        {
                            if (expiredSubscriptions.Any())
                            {
                                foreach (var subscription in expiredSubscriptions)
                                {
                                    subscription.Status = SubscriptionStatus.Expired;
                                }
                            }
                            
                            if(tobeActivatedSubscriptions.Any())
                            {
                                foreach (var subscription in tobeActivatedSubscriptions)
                                {
                                    if (subscription.PlanId != null)
                                    {
                                        var plan = dbContext.Plan.FirstOrDefault(p => p.Id == subscription.PlanId);
                                        if (plan != null)
                                        {
                                            int duration = plan.Duration;
                                            subscription.StartDate = DateTime.Now;
                                            if (duration >= 12)
                                            {
                                                int years = duration / 12;
                                                int months = duration % 12;
                                                subscription.EndDate = subscription.StartDate.AddYears(years).AddMonths(months);
                                            }
                                            else
                                            {
                                                subscription.EndDate = subscription.StartDate.AddMonths(duration);
                                            }
                                            subscription.WarningDate = subscription.EndDate.AddDays(-7);
                                        }
                                    }
                                    subscription.Status = SubscriptionStatus.Avalable;
                                    subscription.IsPaid = false;
                                }
                            }

                            await dbContext.SaveChangesAsync();
                        }
                    }

                    // Wait for a set interval before running again
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken); // Runs every hour
                }
            }
            catch (TaskCanceledException)
            {
                throw new Exception("SubscriptionExpiration Task was canceled.");
            }

        }
    }
}
