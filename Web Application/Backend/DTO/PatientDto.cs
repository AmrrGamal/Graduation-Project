using AIDentify.Models.Enums;
using AIDentify.Models;

namespace AIDentify.DTO
{
    public class PatientDto
    {
        public string PatientName { get; set; }
        public Age Age { get; set; }
        public Gender Gender { get; set; }
        public List<MedicalHistory>? medicalHistories { get; set; }
    }
}
