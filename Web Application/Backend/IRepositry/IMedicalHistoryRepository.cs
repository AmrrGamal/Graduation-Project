using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface IMedicalHistoryRepository
    {
        Task<List<MedicalHistory>> GetAllAsync();
        Task AddAsync(MedicalHistory medicalhistory);
        Task<MedicalHistory?> GetByIdAsync(string id);
        Task DeleteAsync(MedicalHistory medicalHistory);

    }
}
