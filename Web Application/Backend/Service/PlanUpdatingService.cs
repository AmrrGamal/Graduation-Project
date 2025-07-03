using AIDentify.Models.Context;
using AIDentify.Models.Enums;

namespace AIDentify.Service
{
    using AIDentify.ID_Generator;
    using AIDentify.IRepositry;
    using AIDentify.Migrations;
    using AIDentify.Models;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Hosting;
    using System;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    public class PlanUpdatingService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public PlanUpdatingService(IServiceScopeFactory scopeFactory)
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
                        var _idGenerator = scope.ServiceProvider.GetRequiredService<IdGenerator>();

                        var affectedSubscriptions = dbContext.Subscription.Where(s => s.PlanId.EndsWith("Temp")).Include(s => s.Plan).ToList();
                        var subscriptionWithoutPlan = dbContext.Subscription.Where(s => s.Plan == null).ToList();
                        var tempPlans = dbContext.Plan.Where(p => p.Id.EndsWith("Temp")).ToList();

                        foreach (var subscription in affectedSubscriptions)
                        {
                            if (subscription.WarningDate == DateTime.Now.Date)
                            {
                                string warningMessage = "The plan you subscribed to has been updated or no longer exists! " +
                                    "You need to choose one of the currently offered plans at the end of your subscription!";

                                Notification notification = new Notification
                                {
                                    Id = _idGenerator.GenerateId<Notification>(ModelPrefix.Notification),
                                    NotificationContent = warningMessage,
                                    SentAt = DateTime.UtcNow,
                                    DoctorId = subscription.DoctorId,
                                    StudentId = subscription.StudentId
                                };
                                dbContext.Notification.Add(notification);
                            }

                            if (subscription.EndDate <= DateTime.Now)
                            {
                                string endWarningMessage = "Your subscription has ended! " +
                                    "You need to choose one of the currently offered plans!";
                                Notification notification = new Notification
                                {
                                    Id = _idGenerator.GenerateId<Notification>(ModelPrefix.Notification),
                                    NotificationContent = endWarningMessage,
                                    SentAt = DateTime.UtcNow,
                                    DoctorId = subscription.DoctorId,
                                    StudentId = subscription.StudentId
                                };
                                dbContext.Notification.Add(notification);

                                if (subscription.IsPaid == true)
                                {
                                    long moneyBack = subscription.Plan.Price;
                                    
                                    string moneyMessage = "Here is your money back: " + moneyBack.ToString();
                                    notification = new Notification
                                    {
                                        Id = _idGenerator.GenerateId<Notification>(ModelPrefix.Notification),
                                        NotificationContent = moneyMessage,
                                        SentAt = DateTime.UtcNow,
                                        DoctorId = subscription.DoctorId,
                                        StudentId = subscription.StudentId
                                    };
                                    dbContext.Notification.Add(notification);

                                    subscription.IsPaid = false;
                                }

                                subscription.PlanId = null;
                            }
                        }

                        foreach (var subscription in subscriptionWithoutPlan)
                        {
                            if (subscription.IsPaid == true)
                            {
                                subscription.IsPaid = false;
                            }
                        }

                        foreach (var tempPlan in tempPlans)
                        {
                            var connectedSubscriptions = dbContext.Subscription.Where(s => s.Plan ==  tempPlan).ToList();
                            if (connectedSubscriptions.Count == 0)
                            {
                                dbContext.Remove(tempPlan);
                            }
                        }

                        //await dbContext.SaveChangesAsync();
                        await dbContext.SaveChangesAsync();
                    }

                    // Wait for a set interval before running again
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); // Runs every hour
                }
            }
            catch (TaskCanceledException)
            {
                throw new Exception("PlanUpdating Task was canceled.");
            }
        }
    }
}

