using System.ComponentModel.DataAnnotations;

namespace AIDentify.DTO
{
    public class RegisterDto
    {
        [Required]
        [MaxLength(20)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(20)]
        public string LastName { get; set; }
        [Required]
        public String Username { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public String Password { get; set; }

        [Required]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }


        [MaxLength(50)]
        public string? University { get; set; }


        public int? Level { get; set; }

        public string? ClinicName { get; set; }
    }
}
