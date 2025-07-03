using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class UserRepository:IUserRepository
    {
        
        private readonly ContextAIDentify context;
        public UserRepository(ContextAIDentify context)
        {
            
            this.context = context;
        }
        public async Task<List<Doctor>> GetAllDoctorsAsync()
        {
            return await context.Doctor.Include(d => d.Subscription).ToListAsync(); ;
        }
        public async Task<List<Student>> GetAllStudentsAsync()
        {
            return await context.Student.Include(d => d.Subscription).ToListAsync();

        }
        public async Task<List<Admin>> GetAllAdminsAsync()
        {
            return await context.Admin.ToListAsync(); 
        }
        public async Task AddAsAdminAsync(ApplicationUser user)
        {
            var admin = new Admin
            { 
              Admin_ID = user.Id,
              FirstName = user.FirstName,
              LastName = user.LastName,
              UserName = user.UserName,
              Email = user.Email,
              Password = user.PasswordHash
            };
            context.Admin.Add(admin);   
            await context.SaveChangesAsync();

        }

        public async Task AddAsDoctorAsync(ApplicationUser user)
        {
            var doctor = new Doctor
            {
                Doctor_ID = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                Password = user.PasswordHash,
                ClinicName = user.ClinicName
            };
            context.Doctor.Add(doctor);
            await context.SaveChangesAsync();

        }

        public async Task AddAsStudentAsync(ApplicationUser user)
        {
            var student = new Student
            {
                Student_ID = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                Password = user.PasswordHash,
                University = user.University,
                Level = (int)user.Level

            };
            context.Student.Add(student);
            await context.SaveChangesAsync();

        }
        public async Task<Admin?> GetByIdAdminAsync(string id)
        {
            return await context.Admin.FirstOrDefaultAsync(x => x.Admin_ID==id);
        }

        public async Task<Doctor?> GetByIdDoctorAsync(string id)
        {
            return await context.Doctor.FirstOrDefaultAsync(x => x.Doctor_ID == id);
        }

        public async Task<Student?> GetByIdStudentAsync(string id)
        {
            return await context.Student.FirstOrDefaultAsync(x => x.Student_ID == id);
        }
        public async Task DeleteAdmin(string id)
        {
            var admin = await GetByIdAdminAsync(id);
            if (admin == null)
            {
                throw new Exception($"Admin with ID {id} not found");
            }

            context.Admin.Remove(admin);
            await context.SaveChangesAsync();
        }

        public async Task DeleteStudent(string id)
        {
            var Student = await GetByIdStudentAsync(id);
            if (Student == null)
            {
                throw new Exception("Student not found");
            }
            context.Student.Remove(Student);
            await context.SaveChangesAsync();
        }

        public async Task DeleteDoctor(string id)
        {
            var Doctor = await GetByIdDoctorAsync(id);
            if (Doctor == null)
            {
                throw new Exception("Doctor not found");
            }
            context.Doctor.Remove(Doctor);
            await context.SaveChangesAsync();
        }
    }
}
