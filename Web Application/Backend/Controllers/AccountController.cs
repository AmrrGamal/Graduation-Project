using AIDentify.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using AIDentify.DTO;
using Microsoft.AspNetCore.Authorization;
using AIDentify.IRepositry;


namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
      
        private readonly IIdentityRepo _identityRepo;
        private readonly IUserRepository userRepositry;

        public AccountController(IIdentityRepo _identityRepo, IUserRepository userRepositry, SignInManager<ApplicationUser> signInManager)
        {
            this._identityRepo = _identityRepo;
            this.userRepositry = userRepositry;

        }
        [HttpPost("Register_Admin")]
        public async Task<IActionResult> RegisterNewAdmin(RegisterDto user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var admin = new Admin
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.Username,
                Email = user.Email,
                Password = user.Password
            };

            var(success, errors,CreateUser) = await _identityRepo.RegisterAsAdminAsync(admin);
            if (!success || CreateUser == null)
            {
                return BadRequest(new { Errors = errors });
            }
            await userRepositry.AddAsAdminAsync(CreateUser);
            return Ok("Admin registered successfully");
        }

        [HttpPost("Register_Doctor")]
        public async Task<IActionResult> RegisterDoctor(RegisterDto user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user1 = new Doctor
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.Username,
                Email = user.Email,
                Password = user.Password,
                ClinicName = user.ClinicName

            };

            var (success, errors, CreateUser) = await _identityRepo.RegisterAsDoctorAsync(user1);
            if (!success || CreateUser == null)
            {
                return BadRequest(new { Errors = errors });
            }
            await userRepositry.AddAsDoctorAsync(CreateUser);

            return Ok("Doctor registered successfully");
        }

        [HttpPost("Register_Student")]
        public async Task<IActionResult> RegisterNewStudent(RegisterDto user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user1 = new Student();
            {
                user1.FirstName = user.FirstName;
                user1.LastName = user.LastName;
                user1.UserName = user.Username;
                user1.Email = user.Email;
                user1.Password = user.Password;
                user1.University = user.University;
                user1.Level = (int)user.Level;
            }
            var (success, errors, CreateUser) = await _identityRepo.RegisterAsStudentAsync(user1);
            if (!success || CreateUser == null)
            {
                return BadRequest(new { Errors = errors });
            }
            await userRepositry.AddAsStudentAsync(CreateUser);
            return Ok("Student registered successfully");
        }

        [HttpPost("Login")]
        public async Task<IActionResult> LogIn(LoginDto login)
        {
            var result = await _identityRepo.LoginAsync(login.UserName, login.Password);
            if(result.Success)
            {
                return Ok(new { tokens = result.Token, roles = result.Roles });
            }
            return BadRequest(result.Errors);  
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            var result = await _identityRepo.LogoutAsync(token);
            if (!result.Success)
            {
                return BadRequest(new { result.Errors });
            }
            return Ok(new { message = "Logged out successfully"});
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgetPassDto model)
        {
            var user = await _identityRepo.GetUserByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            var resetToken = await _identityRepo.GetNewTokenAsync(user);

            var resetLink = $"{Request.Scheme}://{Request.Host}/api/Account/reset-password?token={resetToken}&email={model.Email}";

            return Ok(new { message = "Password reset link generated", resetLink });
        }


        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPassDto model)
        {
            var user = await _identityRepo.GetUserByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            var resetResult = await _identityRepo.ResetNewPassword(user, model.Token, model.NewPassword);
            if (!resetResult.Succeeded)
            {
                return BadRequest(new { message = "Password reset failed", errors = resetResult.Errors });
            }

            return Ok(new { message = "Password reset successfully" });
        }


        [HttpDelete("Delete_Account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized(new { message = "User is not logged in" });

            var user = await _identityRepo.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            var roles = await _identityRepo.GetUserRolesAsync(user);
            var role = roles.FirstOrDefault();

            if (role == "Doctor")
            {
                var doctor = await userRepositry.GetByIdDoctorAsync(user.Id);
                if (doctor != null)
                {
                    await userRepositry.DeleteDoctor(doctor.Doctor_ID);
                }
            }
            else if (role == "Student")
            {
                var student = await userRepositry.GetByIdStudentAsync(user.Id);
                if (student != null)
                {
                    await userRepositry.DeleteStudent(student.Student_ID);
                }
            }
            else if (role == "Admin")
            {
                var admin = await userRepositry.GetByIdAdminAsync(user.Id);
                if (admin != null)
                {
                    await userRepositry.DeleteAdmin(admin.Admin_ID);
                }
            }
            else
            {
                return BadRequest(new { message = "Role not recognized" });
            }


            var result = await _identityRepo.DeleteUserByIdAsync(userId);
            if (result.Succeeded)
            {
                return Ok(new { message = $"{role} Account Deleted Successfully" });
            }

            return BadRequest(result.Errors);
        }


    }
}
