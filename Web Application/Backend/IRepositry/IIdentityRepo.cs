using AIDentify.Models;
using Microsoft.AspNetCore.Identity;

namespace AIDentify.IRepositry
{
    public interface IIdentityRepo
    {
        Task<(bool Success, List<string> Errors, ApplicationUser? User)> RegisterAsAdminAsync(Admin user);
        Task<(bool Success, List<string> Errors, ApplicationUser? User)> RegisterAsDoctorAsync(Doctor user);
        Task<(bool Success, List<string> Errors, ApplicationUser? User)> RegisterAsStudentAsync(Student user);
        Task<(bool Success, string Token, List<string> Errors, List<string> Roles)> LoginAsync(string Username, String password);
        Task<(bool Success, List<string> Errors)> LogoutAsync(string token);
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
        Task<string> GetNewTokenAsync(ApplicationUser user);
        Task<IdentityResult> ResetNewPassword(ApplicationUser user, string token, string newPassword);
        Task<ApplicationUser?> GetUserByIdAsync(string userId);
        Task<IList<string>> GetUserRolesAsync(ApplicationUser user);
        Task<IdentityResult> DeleteUserByIdAsync(string userId);

    }
}
