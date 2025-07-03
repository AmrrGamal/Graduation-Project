using AIDentify.IRepositry;
using AIDentify.Models.Context;
using AIDentify.Models;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class PatientRepository : IPatientRepository
    {
        private readonly ContextAIDentify context;

        public PatientRepository(ContextAIDentify context)
        {
            this.context = context;
        }
        public async Task<List<Patient>> GetAllAsync()
        {
             return await context.Patient.Include(p => p.MedicalHistories).ToListAsync();
        }
        public async Task AddAsync(Patient patient)
        {
            await context.Patient.AddAsync(patient);
            await context.SaveChangesAsync();
        }
        public async Task<Patient?> GetByIdAsync(string id)
        {
            return await context.Patient.Include(p => p.MedicalHistories).FirstOrDefaultAsync(e => e.Id == id);
        }
        public async Task<List<Patient>> GetByNameAsync(string name)
        {
            
            return await context.Patient.Include(p => p.MedicalHistories).Where(p => p.PatientName.ToLower().Contains(name.ToLower())).ToListAsync(); ;
        }

        public async Task<Patient> UpdateAsync(Patient patient)
        {
            var existingPatient = await GetByIdAsync(patient.Id);
            if (existingPatient == null)
            {
                return null;
            }

            existingPatient.PatientName = patient.PatientName;
            existingPatient.age = patient.age;
            existingPatient.gender = patient.gender;


            //context.Patient.Update(existingPatient);
            await context.SaveChangesAsync();

            return existingPatient;
        }

        public async Task DeleteAsync(Patient patient)
        {
            var patientToDelete = await GetByIdAsync(patient.Id);
            if (patientToDelete == null)
            {
                throw new ArgumentException("Patient not found.");
            }
            context.Patient.Remove(patientToDelete);
            await context.SaveChangesAsync();

        }

        public async Task<int> CountByIdAsync(string id)
        {
           return await context.Patient.Where(d=>d.DoctorId == id).CountAsync(); 
        }
    }
}
