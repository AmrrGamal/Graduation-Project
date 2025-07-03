using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.ID_Generator
{
    public class IdGenerator
    {
        private readonly ContextAIDentify _context;

        public IdGenerator(ContextAIDentify context)
        {
            _context = context;
        }

        public string GenerateId<T>(ModelPrefix prefix) where T : class
        {
            string prefixStr = prefix.ToString().ToLower() + "-";
            int nextId = 1; // Default start value

            // Get all IDs and extract their numeric parts
            var lastNumber = _context.Set<T>()
                .Select(e => EF.Property<string>(e, "Id"))
                .Where(id => id.StartsWith(prefixStr)) // Ensure we only consider relevant IDs
                .AsEnumerable() // Switch to LINQ to Objects to avoid EF limitations
                .Select(id =>
                {
                    int number;
                    return int.TryParse(id.Split('-').Last(), out number) ? number : 0;
                }) // Extract numeric part
                .OrderByDescending(n => n) // Sort numerically
                .FirstOrDefault();

            // Increment the last number found
            nextId = lastNumber + 1;

            return $"{prefixStr}{nextId}";
        }
    }

}
