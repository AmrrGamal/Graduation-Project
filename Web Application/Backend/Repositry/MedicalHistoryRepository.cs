using AIDentify.IRepositry;
using AIDentify.Models.Context;
using AIDentify.Models;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class MedicalHistoryRepository: IMedicalHistoryRepository
    {
        private readonly ContextAIDentify context;
        public MedicalHistoryRepository(ContextAIDentify context)
        {
            this.context = context;
        }

        public async Task<List<MedicalHistory>> GetAllAsync()
        {
            return await context.MedicalHistory.Include(s => s.Patient).ToListAsync();
        }

        public async Task AddAsync(MedicalHistory medicalhistory)
        {
            await context.MedicalHistory.AddAsync(medicalhistory);
            await context.SaveChangesAsync();
        }

        public async Task<MedicalHistory?> GetByIdAsync(string id)
        {
            return await context.MedicalHistory.Include(p => p.Patient).FirstOrDefaultAsync(e => e.Id == id);
        }
        public async Task DeleteAsync(MedicalHistory medicalHistory)
        {
            var medical = await GetByIdAsync(medicalHistory.Id);
            if (medical == null)
            {
                throw new ArgumentException("Medical history not found.");
            }
            context.MedicalHistory.Remove(medical);
            await context.SaveChangesAsync();

        }
        //public async Task<MedicalHistory> UpdateAsync(MedicalHistory medicalHistory)
        //{
        //    var newMedical = await GetByIdAsync(medicalHistory.Id);
        //    if (newMedical == null)
        //    {
        //        return null;
        //    }

        //    newMedical.VisitDate = medicalHistory.VisitDate;
        //    // NewMedical.TeethCount = medicalhistory.TeethCount;
        //    newMedical.Diagnosis = medicalHistory.Diagnosis;

        //    context.MedicalHistory.Update(newMedical);
        //    await context.SaveChangesAsync();

        //    return newMedical;
        //}
    }
}
