using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface IXRayScanRepository
    {
        Task<XRayScan?> GetByIdAsync(string id);
        Task<List<XRayScan>> GetAllAsync();
        Task AddAsync(XRayScan xRayScan);
        Task UpdateAsync(XRayScan xRayScan);
        Task<Dictionary<string, XRayScan>> GetByIdsAsync(List<string> xrayScanIds);
        Task DeleteAsync(string id);
        Task<int> CountByIdAsync(string id);
    }
}
