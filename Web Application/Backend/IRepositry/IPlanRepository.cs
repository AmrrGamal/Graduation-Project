using AIDentify.Models;
using AIDentify.Models.Context;

namespace AIDentify.IRepositry
{
    public interface IPlanRepository
    {
        List<Plan> GetAll();
        Plan? Get(string id);
        List<Plan> GetPlansForDoctor();
        List<Plan> GetPlansForStudent();
        void Add(Plan Plan);
        List<Subscription> GetSubscriptions(Plan plan);
        void Update(Plan plan);
        void Delete(Plan Plan);
        bool Deleteable(string id);
        bool PlanExists(string id);

    }
}
