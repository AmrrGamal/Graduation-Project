using AIDentify.Models.Context;
using AIDentify.Models.Enums;

namespace AIDentify.Service
{
    using AIDentify.IRepositry;
    using AIDentify.Models;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Hosting;
    using System;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    public class SubscriptionFilteringService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public SubscriptionFilteringService(IServiceScopeFactory scopeFactory)
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
                        IEnumerable<Subscription> UnNeededSubscriptions = dbContext.Subscription
                            .Where(s => s.DoctorId == null && s.StudentId == null)
                            .ToList();

                        if (UnNeededSubscriptions.Any())
                        {
                            foreach (var subscription in UnNeededSubscriptions)
                            {
                                var studentWithSubscription = dbContext.Student.Where(s => s.SubscriptionId == subscription.Id).ToList();
                                var doctorWithSubscription = dbContext.Doctor.Where(s => s.SubscriptionId == subscription.Id).ToList();
                                
                                if (studentWithSubscription.Any())
                                {
                                    foreach(var student in studentWithSubscription)
                                    {
                                        subscription.StudentId = student.Student_ID;
                                    }
                                } else if (doctorWithSubscription.Any())
                                {
                                    foreach( var doctor in doctorWithSubscription)
                                    {
                                        subscription.DoctorId = doctor.Doctor_ID;
                                    }
                                }
                                else
                                {
                                    dbContext.Subscription.Remove(subscription);
                                }

                            }
                            await dbContext.SaveChangesAsync();
                        }
                    }

                    // Wait for a set interval before running again
                    await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);
                }
            }
            catch(TaskCanceledException) 
            {
                throw new Exception("SubscriptionFiltering Task was canceled.");
            }
        }
    }
}
