using AIDentify.DTO;
using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class XRayScanRepository : IXRayScanRepository
    {
        private readonly ContextAIDentify _context;

        public XRayScanRepository(ContextAIDentify context)
        {
            _context = context;
        }

        public async Task<XRayScan?> GetByIdAsync(string id)
        {
            return await _context.XRayScan.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<XRayScan>> GetAllAsync()
        {
            return await _context.XRayScan.ToListAsync();
        }

        public async Task AddAsync(XRayScan xRayScan)
        {
            await _context.XRayScan.AddAsync(xRayScan);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(XRayScan xRayScan)
        {
            _context.XRayScan.Update(xRayScan);
            await _context.SaveChangesAsync();
        }

        public async Task<Dictionary<string, XRayScan>> GetByIdsAsync(List<string> xrayScanIds)
        {
            return await _context.XRayScan
                .Where(x => xrayScanIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id);
        }

        public async Task<int> CountByIdAsync(string id)
        {
            return await _context.XRayScan.Where(x => x.DoctorId == id || x.StudentId ==id).CountAsync();

        }


        public async Task DeleteAsync(string id)
        {
            bool isUsed = await _context.MedicalHistory.AnyAsync(m => m.XRayScanId == id);
            if (isUsed)
            {
                throw new InvalidOperationException($"XRayScan with ID {id} cannot be deleted because it is referenced by MedicalHistory.");
            }

            var xRayScan = await GetByIdAsync(id);
            if (xRayScan == null)
            {
                throw new ArgumentException($"XRayScan with ID {id} not found.");
            }

            _context.XRayScan.Remove(xRayScan);
            await _context.SaveChangesAsync();
        }
    }

}
