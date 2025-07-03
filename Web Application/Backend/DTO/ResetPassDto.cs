namespace AIDentify.DTO
{
    public class ResetPassDto
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}
