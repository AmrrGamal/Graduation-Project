using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace AIDentify.Repositry
{
    public class IdentityRepo :IIdentityRepo
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly SignInManager<ApplicationUser> signInManager;
        internal static readonly ConcurrentDictionary<string, DateTime> _blacklistedTokens = new();

        public IdentityRepo(UserManager<ApplicationUser> _userManager, IConfiguration _configuration, RoleManager<IdentityRole> roleManager, SignInManager<ApplicationUser> signInManager)
        {
            this._userManager = _userManager;
            this._configuration = _configuration;
            this.roleManager = roleManager;
            this.signInManager = signInManager;
        }

        public async Task<(bool Success, List<string> Errors, ApplicationUser? User)> RegisterAsAdminAsync(Admin user)
        {
            ApplicationUser newUser = new ApplicationUser();
            {
                newUser.FirstName = user.FirstName;
                newUser.LastName = user.LastName;
                newUser.UserName = user.UserName;
                newUser.Email = user.Email;

            }
            IdentityResult result = await _userManager.CreateAsync(newUser, user.Password);
            if (!result.Succeeded)
            {
                return (false, result.Errors.Select(e => e.Description).ToList(),null);
            }
            await _userManager.AddToRoleAsync(newUser, "Admin");
            return (true, new List<string>(),newUser);
        }
        public async Task<(bool Success, List<string> Errors, ApplicationUser? User)> RegisterAsDoctorAsync(Doctor user)
        {
            ApplicationUser newUser = new ApplicationUser();
            {
                newUser.FirstName = user.FirstName;
                newUser.LastName = user.LastName;
                newUser.UserName = user.UserName;
                newUser.Email = user.Email;
                newUser.ClinicName = user.ClinicName;

            }
            IdentityResult result = await _userManager.CreateAsync(newUser, user.Password);
            if (!result.Succeeded)
            {
                return (false, result.Errors.Select(e => e.Description).ToList(),null);
            }
            await _userManager.AddToRoleAsync(newUser, "Doctor");
            return (true, new List<string>(),newUser);
        }

        public async Task<(bool Success, List<string> Errors, ApplicationUser? User)> RegisterAsStudentAsync(Student user)
        {
            ApplicationUser newUser = new ApplicationUser();
            {
                newUser.FirstName = user.FirstName;
                newUser.LastName = user.LastName;
                newUser.UserName = user.UserName;
                newUser.Email = user.Email;
                newUser.University = user.University;
                newUser.Level = user.Level;

            }
            IdentityResult result = await _userManager.CreateAsync(newUser, user.Password);
            if (!result.Succeeded)
            {
                return (false, result.Errors.Select(e => e.Description).ToList(),null);
            }
            await _userManager.AddToRoleAsync(newUser, "Student");
            return (true, new List<string>(),newUser);
        }

        public async Task<(bool Success, string Token, List<string> Errors, List<string> Roles)> LoginAsync(string Username,String password)
        {
            var user = await _userManager.FindByNameAsync(Username);
            if (user == null)
                return (false, null, new() { "Invalid username or password" }, null);

            var result = await signInManager.CheckPasswordSignInAsync(user, password, false);
            if (!result.Succeeded)
                return (false, null, new() { "Invalid username or password" }, null);

            var claims = new List<Claim>
            {
               new Claim(ClaimTypes.Name, user.UserName),
               new Claim(ClaimTypes.NameIdentifier, user.Id),
               new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var secretKey = _configuration["JWT:SecretKey"];
            var issuer = _configuration["JWT:Issuer"];
            var audience = _configuration["JWT:Audience"];

            if (string.IsNullOrEmpty(secretKey)) throw new ArgumentNullException("JWT:SecretKey");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return (true, tokenString, new(), roles.ToList());
        }

        public async Task<(bool Success,List<string> Errors)> LogoutAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return(false, new() { "No token provided" });

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var exp = jwtToken.Claims.FirstOrDefault(c => c.Type == "exp")?.Value;

            if (exp == null)
                return(false, new() { "Invalid token" });

            var expiry = DateTimeOffset.FromUnixTimeSeconds(long.Parse(exp)).UtcDateTime;
            _blacklistedTokens[token] = expiry;

            return(true, new() { "Logged out successfully" });
        }

        public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }
        public bool IsTokenBlacklisted(string token)
        {
            return _blacklistedTokens.ContainsKey(token);
        }
        public async Task<string> GetNewTokenAsync(ApplicationUser user)
        {
           return await _userManager.GeneratePasswordResetTokenAsync(user);
        }
        public async Task<IdentityResult> ResetNewPassword(ApplicationUser user, string token, string newPassword)
        {
            return await _userManager.ResetPasswordAsync(user, token, newPassword);
        }
        public async Task<ApplicationUser?> GetUserByIdAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }
        public async Task<IList<string>> GetUserRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }
        public async Task<IdentityResult> DeleteUserByIdAsync(string userId)
        {
            var user = await GetUserByIdAsync(userId);

            if (user == null)
            {
                var error = new IdentityError { Description = "User Not Found " };
                return IdentityResult.Failed(error);
            }

            return await _userManager.DeleteAsync(user);
        }






    }
}
