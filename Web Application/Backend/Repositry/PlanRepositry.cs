using AIDentify.Models.Context;
using AIDentify.Models;
using AIDentify.IRepositry;

namespace AIDentify.Repositry
{
    public class PlanRepositry : IPlanRepository
    {
        private readonly ContextAIDentify _context;
        public PlanRepositry(ContextAIDentify context)
        {
            _context = context;
        }

        public List<Plan> GetAll()
        {
            return _context.Plan.ToList();
        }

        public Plan? Get(string id)
        {
            return _context.Plan.Find(id);
        }

        public List<Plan> GetPlansForDoctor()
        {
            return _context.Plan.Where(p => p.MaxPatients > 0).ToList();
        }

        public List<Plan> GetPlansForStudent()
        {
            return _context.Plan.Where(p => p.MaxPatients == 0).ToList();
        }

        public void Add(Plan Plan)
        {
            _context.Plan.Add(Plan);
            _context.SaveChanges();
        }

        public List<Subscription> GetSubscriptions(Plan plan)
        {
            return _context.Subscription.Where(s => s.Plan == plan).ToList();
        }

        public void Update(Plan plan)
        {
            var existingPlan = _context.Plan.Find(plan.Id);

            if (existingPlan != null)
            {
                _context.Entry(existingPlan).CurrentValues.SetValues(plan);
                _context.SaveChanges();
            }
        }

        public void Delete(Plan Plan)
        {
            if (Plan != null)
            {
                _context.Plan.Remove(Plan);
                _context.SaveChanges();
            }
        }

        public bool Deleteable(string id)
        {
            bool hasSubscriptions = _context.Subscription.Any(s => s.PlanId == id);
            if (hasSubscriptions)
            {
                return false;
            }
            return true;
        }

        public bool PlanExists(string id)
        {
            return _context.Plan.Any(e => e.Id == id);
        }
    }
}
