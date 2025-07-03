using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface IPatientRepository
    {
        Task<List<Patient>> GetAllAsync();
        Task AddAsync(Patient patient);
        Task<Patient?> GetByIdAsync(string id);
        Task<List<Patient>> GetByNameAsync(string name);
        Task<Patient> UpdateAsync(Patient patient);
        Task DeleteAsync(Patient patient);
        Task<int> CountByIdAsync(string id);
    }
}
