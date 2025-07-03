using AIDentify.ID_Generator;
using AIDentify.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using AIDentify.IRepositry;
using AIDentify.DTO;
using Microsoft.AspNetCore.Authorization;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Doctor")]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly IMedicalHistoryRepository medical;
        private readonly IPatientRepository patient;
        private readonly IdGenerator id_Generator;
        private readonly IXRayScanRepository xray;
        public MedicalHistoryController(IMedicalHistoryRepository medical, IPatientRepository patient, IdGenerator id_Generator, IXRayScanRepository xray)
        {
            this.medical = medical;
            this.patient = patient;
            this.id_Generator = id_Generator;
            this.xray = xray;
        }
      
        [HttpGet]
        public async Task<IActionResult> GetMedical()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var doctorPatients = await patient.GetAllAsync();
            var doctorPatientIds = doctorPatients.Where(p => p.DoctorId == userId).Select(p => p.Id)
                                        .ToHashSet();

            var medicalGetAll = await medical.GetAllAsync();
            var medicalAll = medicalGetAll.Where(m => doctorPatientIds.Contains(m.PatientId))
                                       .ToList();

            return Ok(medicalAll);
        }


        [HttpGet("{id}")]
        public async  Task<IActionResult> GetById(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var medicalResult = await medical.GetByIdAsync(id);
            if (medicalResult == null)
            {
                return NotFound("Medical record not found");
            }

            var patientEntity = await patient.GetByIdAsync(medicalResult.PatientId);
            if (patientEntity == null || patientEntity.DoctorId != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You are not allowed to view this medical history.");
            }

            return Ok(medicalResult);
        }

       // [HttpPost("from-scan")]
        //public async Task<IActionResult> CreateFromScan([FromBody] CreateHistoryFromScanDto createHistoryFromScanDto)
        //{
        //    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        //    var scan = await xray.GetByIdAsync(createHistoryFromScanDto.ScanId);
        //    if (scan == null)
        //        return NotFound("X-Ray scan not found.");

        //    if (scan.DoctorId != userId)
        //        return StatusCode(StatusCodes.Status403Forbidden, "You are not allowed to add medical history for this scan.");

        //    var patientEntity = await patient.GetByIdAsync(createHistoryFromScanDto.PatientId);
        //    if (patientEntity == null || patientEntity.DoctorId != userId)
        //        return BadRequest("Invalid or unauthorized patient.");

        //    var history = new MedicalHistory
        //    {
        //        Id = id_Generator.GenerateId<MedicalHistory>(ModelPrefix.MedicalHistory),
        //        XRayScanId = createHistoryFromScanDto.ScanId,
        //        PatientId = createHistoryFromScanDto.PatientId,
        //        TeethPrediction = scan.TeethPrediction,
        //        DiseasePrediction = scan.DiseasePrediction,
        //        Diagnosis = "Auto-generated from X-Ray Scan",
        //        VisitDate = DateTime.Now
        //    };

        //    await medical.AddAsync(history);
        //    return Ok(history);
        //}
        [HttpPost("from-scan")]
        public async Task<IActionResult> CreateFromScan([FromForm] CreateHistoryFromScanDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            byte[] diseasePrediction = null;
            string teethPrediction = null;

            if (!string.IsNullOrEmpty(dto.ScanId))
            {
                var scan = await xray.GetByIdAsync(dto.ScanId);
                if (scan == null)
                    return NotFound("Scan not found.");

                if (scan.DoctorId != userId)
                    return StatusCode(StatusCodes.Status403Forbidden, "You are not allowed to use this scan.");

                diseasePrediction = scan.DiseasePrediction;
                teethPrediction = scan.TeethPrediction;
            }
            else
            {
                if (dto.Prediction == null || dto.Prediction.Length == 0)
                    return BadRequest("Prediction image is required.");

                using var memoryStream = new MemoryStream();
                await dto.Prediction.CopyToAsync(memoryStream);
                diseasePrediction = memoryStream.ToArray();

                teethPrediction = dto.teeth;
            }

            var patientEntity = await patient.GetByIdAsync(dto.PatientId);
            if (patientEntity == null || patientEntity.DoctorId != userId)
                return BadRequest("Invalid or unauthorized patient.");

            var history = new MedicalHistory
            {
                Id = id_Generator.GenerateId<MedicalHistory>(ModelPrefix.MedicalHistory),
                XRayScanId = dto.ScanId,
                PatientId = dto.PatientId,
                TeethPrediction = teethPrediction,
                DiseasePrediction = diseasePrediction,
                Diagnosis = dto.Diagnosis,
                VisitDate = DateTime.Now
            };

            await medical.AddAsync(history);

            return Ok(history);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existingMedical = await medical.GetByIdAsync(id);
            if (existingMedical == null)
            {
                return NotFound("Medical Not Found");
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var relatedPatient = await patient.GetByIdAsync(existingMedical.PatientId);
            if (relatedPatient == null || relatedPatient.DoctorId != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You are not allowed to delete this medical history.");
            }

            await medical.DeleteAsync(existingMedical);
            return Ok("deleted successfully.");

        }
    }
}
