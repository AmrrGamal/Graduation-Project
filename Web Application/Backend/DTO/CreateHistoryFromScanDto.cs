namespace AIDentify.DTO
{
    public class CreateHistoryFromScanDto
    {
        public string? ScanId { get; set; }
        public string PatientId { get; set; }
        public IFormFile? Prediction { get; set; }
        public string? teeth { get; set; }

        public string Diagnosis { get; set; }


    }
}
