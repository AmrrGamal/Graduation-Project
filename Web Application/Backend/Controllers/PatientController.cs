using AIDentify.DTO;
using AIDentify.ID_Generator;
using AIDentify.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using AIDentify.IRepositry;
using Microsoft.AspNetCore.Authorization;
using AIDentify.Repositry;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Doctor")]
    public class PatientController : ControllerBase
    {
        IPatientRepository patientRepository;
        private readonly IdGenerator id_Generator;
        private readonly IXRayScanRepository xRayScanRepository;
        private readonly IUserRepository userRepository;
        private readonly ISubscriptionRepository subscriptionRepository;
        public PatientController(IPatientRepository patientRepository, ISubscriptionRepository subscriptionRepository,IdGenerator id_Generator, IUserRepository userRepository, IXRayScanRepository xRayScanRepository)
        {
            this.patientRepository = patientRepository;
            this.id_Generator = id_Generator;
            this.xRayScanRepository = xRayScanRepository;
            this.userRepository = userRepository;
            this.subscriptionRepository = subscriptionRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetPatients()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var patients = await patientRepository.GetAllAsync();
            var allPatients= patients.Where(p => p.DoctorId == userId).ToList();
            return Ok(allPatients);
        }



        [HttpPost]
        public async Task<IActionResult> AddPatients([FromBody] PatientDto patientDto)
        {
            var doctorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var doctorName = User.FindFirstValue(ClaimTypes.Name);

            if (doctorId == null || doctorName == null)
                return Unauthorized("Invalid token: no DoctorId found");

            var subscription = subscriptionRepository.GetSubscriptionByUserId(doctorId);
            if (subscription == null || subscription.Plan == null)
                return BadRequest("Doctor does not have an active subscription.");

            int maxPatients = subscription.Plan.MaxPatients;
            int currentPatientCount = await patientRepository.CountByIdAsync(doctorId);

            if (currentPatientCount >= maxPatients)
                return BadRequest("You have reached the maximum number of patients allowed in your plan.");

            Dictionary<string, XRayScan> xrayScans = new();
            if (patientDto.medicalHistories != null && patientDto.medicalHistories.Any())
            {
                var xrayScanIds = patientDto.medicalHistories
                    .Where(h => !string.IsNullOrEmpty(h.XRayScanId))
                    .Select(h => h.XRayScanId)
                    .Distinct()
                    .ToList();

                xrayScans = await xRayScanRepository.GetByIdsAsync(xrayScanIds);
            }

            var patient = new Patient
            {
                Id = id_Generator.GenerateId<Patient>(ModelPrefix.Patient),
                PatientName = patientDto.PatientName,
                age = patientDto.Age,
                gender = patientDto.Gender,
                DoctorId = doctorId,
                DoctorName = doctorName,
                MedicalHistories = new List<MedicalHistory>()
            };

            if (patientDto.medicalHistories != null && patientDto.medicalHistories.Any())
            {
                foreach (var h in patientDto.medicalHistories)
                {
                    XRayScan scan = null;
                    if (!string.IsNullOrEmpty(h.XRayScanId))
                        xrayScans.TryGetValue(h.XRayScanId, out scan);

                    patient.MedicalHistories.Add(new MedicalHistory
                    {
                        Id = id_Generator.GenerateId<MedicalHistory>(ModelPrefix.MedicalHistory),
                        Diagnosis = h.Diagnosis ?? "",
                        VisitDate = h.VisitDate,
                        XRayScanId = h.XRayScanId,
                        TeethPrediction = scan?.TeethPrediction,
                        DiseasePrediction = scan?.DiseasePrediction
                    });
                }
            }

            await patientRepository.AddAsync(patient);
            return Ok(patient);
        }




        [HttpGet("SearchByName/{Name}")]

        public async Task<IActionResult> Search(string Name)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var results = await patientRepository.GetByNameAsync(Name);
            var userResults = results.Where(p => p.DoctorId == userId).ToList();
            if (!userResults.Any())
            {
                return NotFound("Patient not found.");
            }
            return Ok(userResults);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await patientRepository.GetByIdAsync(id);
            if (result == null || result.DoctorId != userId)
            {
                return NotFound("Patient not found.");
            }
            return Ok(result);

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(String Id)
        {
            var patient = await patientRepository.GetByIdAsync(Id);
            if (patient == null)
            {
                return NotFound("Patient not found.");

            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (patient.DoctorId != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You are not allowed to delete this patient.");
            }

            await patientRepository.DeleteAsync(patient);
            return Ok("Patient deleted successfully.");

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(String Id, PatientDto patientDto)
        {
            var existingPatient = await patientRepository.GetByIdAsync(Id);
            if (existingPatient == null)
            {
                return NotFound("Patient not found.");

            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (existingPatient.DoctorId != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You are not allowed to update this patient.");
            }

            existingPatient.gender = patientDto.Gender;
            existingPatient.age = patientDto.Age;
            existingPatient.PatientName = patientDto.PatientName;

            await patientRepository.UpdateAsync(existingPatient);
            return Ok(existingPatient);

        }
    }
}
