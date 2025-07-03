namespace AIDentify.DTO
{
    public class UpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? ClinicName { get; set; } // For doctors
        public string? University { get; set; } // For students
        public int? Level { get; set; } // For students
    }
}
