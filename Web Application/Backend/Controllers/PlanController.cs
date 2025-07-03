using AIDentify.ID_Generator;
using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AIDentify.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class PlanController : ControllerBase
    {
        private readonly IPlanRepository PlanRepository;
        private readonly ISystemUpdateRepository SystemUpdateRepository;
        private readonly IdGenerator _idGenerator;
        private UpdateType updateTypePlan = UpdateType.Plan;

        private const int TheNullValue = -1;

        public PlanController(IPlanRepository planRepository, IdGenerator idGenerator, ISystemUpdateRepository systemUpdateRepository)
        {
            PlanRepository = planRepository;
            _idGenerator = idGenerator;
            SystemUpdateRepository = systemUpdateRepository;
        }

        #region Get All

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAll()
        {
            return Ok(PlanRepository.GetAll());
        }

        #endregion

        #region Get By Id

        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            return Ok(PlanRepository.Get(id));
        }

        #endregion

        #region Get All Plans Available for Students
        [HttpGet("students")]
        public IActionResult GetAllForStudent()
        {
            var plans = PlanRepository.GetPlansForStudent();
            if (plans == null || !plans.Any())
            {
                return NotFound("No plans available for students.");
            }
            return Ok(plans);
        }
        #endregion

        #region Get All Plans Available for Doctors
        [HttpGet("doctors")]
        public IActionResult GetAllForDoctor()
        {
            var plans = PlanRepository.GetPlansForDoctor();
            if (plans == null || !plans.Any())
            {
                return NotFound("No plans available for doctors.");
            }
            return Ok(plans);
        }
        #endregion

        #region Add New Plan
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult Add([FromBody] Plan plan)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (adminIdClaim == null)
            {
                return Unauthorized("Invalid Token: Admin ID not found in claims");
            }
            var adminId = adminIdClaim.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return BadRequest("Admin ID is required");
            }

            plan.Id = _idGenerator.GenerateId<Plan>(ModelPrefix.Plan);

            if(plan.PlanName == string.Empty)
            {
                return BadRequest("Plan name cannot be empty.");
            }
            if (plan.Duration == TheNullValue)
            {
                return BadRequest("Duration cannot be empty.");
            }
            if (plan.MaxScans == TheNullValue)
            {
                return BadRequest("Max Scans cannot be empty.");
            }
            if (plan.Price == TheNullValue)
            {
                return BadRequest("Price cannot be empty.");
            }

            SystemUpdate systemUpdate = new SystemUpdate {
                Id = _idGenerator.GenerateId<SystemUpdate>(ModelPrefix.SystemUpdate),
                UpdatedDescription = "Plan: " + plan.PlanName + " was added, with price of " + plan.Price.ToString(),
                UpdateType = updateTypePlan,
                AdminId = adminId
            };

            SystemUpdateRepository.AddSystemUpdate(adminId, systemUpdate);
            PlanRepository.Add(plan);

            return Ok("Posted Successfully");
        }

        #endregion

        #region Update Plan

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Update(string id, [FromBody] Plan plan)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (adminIdClaim == null)
            {
                return Unauthorized("Invalid Token: Admin ID not found in claims");
            }
            var adminId = adminIdClaim.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return BadRequest("Admin ID is required");
            }

            plan.Id = id;

            var existingPlan = PlanRepository.Get(id);
            if (existingPlan == null)
            {
                return NotFound("Plan not found.");
            }

            List<Subscription> subscriptions = PlanRepository.GetSubscriptions(existingPlan);
            if (subscriptions.Count > 0)
            {
                Plan planTemp = new Plan
                {
                    Id = existingPlan.Id + "-Temp",
                    PlanName = existingPlan.PlanName,
                    Duration = existingPlan.Duration,
                    MaxScans = existingPlan.MaxScans,
                    MaxPatients = existingPlan.MaxPatients,
                    Price = existingPlan.Price
                };

                PlanRepository.Add(planTemp);

                foreach(var subscription in subscriptions)
                {
                    subscription.PlanId = planTemp.Id;
                }
            }


            // Update the old plan with the new values
            if (plan.PlanName == string.Empty)
            {
                plan.PlanName = existingPlan.PlanName;
            }
            if (plan.Duration == TheNullValue)
            {
                plan.Duration = existingPlan.Duration;
            }
            if (plan.MaxScans == TheNullValue)
            {
                plan.MaxScans = existingPlan.MaxScans;
            }
            if (plan.MaxPatients == TheNullValue)
            {
                plan.MaxPatients = existingPlan.MaxPatients;
            }
            if (plan.Price == TheNullValue)
            {
                plan.Price = existingPlan.Price;
            }

            SystemUpdate systemUpdate = new SystemUpdate
            {
                Id = _idGenerator.GenerateId<SystemUpdate>(ModelPrefix.SystemUpdate),
                UpdatedDescription = "Plan: " + plan.PlanName + " was updated",
                UpdateType = updateTypePlan,
                AdminId = adminId
            };  //here

            SystemUpdateRepository.AddSystemUpdate(adminId, systemUpdate);  //here

            // Update the plan in the repository
            existingPlan = plan;

            PlanRepository.Update(existingPlan);

            return Ok("Updated Successfully");
        }

        #endregion

        #region Delete Plan

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Delete(string id)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (adminIdClaim == null)
            {
                return Unauthorized("Invalid Token: Admin ID not found in claims");
            }
            var adminId = adminIdClaim.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return BadRequest("Admin ID is required");
            }

            Plan? plan = PlanRepository.Get(id);
            if(plan != null)
            {
                if (PlanRepository.Deleteable(id))
                {
                    SystemUpdate systemUpdate = new SystemUpdate
                    {
                        Id = _idGenerator.GenerateId<SystemUpdate>(ModelPrefix.SystemUpdate),
                        UpdatedDescription = "Plan: " + plan.PlanName + " was deleted",
                        UpdateType = updateTypePlan,
                        AdminId = adminId
                    };

                    SystemUpdateRepository.AddSystemUpdate(adminId, systemUpdate);


                    PlanRepository.Delete(plan);
                    return Ok("Deleted Successfully");
                }
                else
                {
                    return BadRequest("Plan has active subscriptions. Cannot delete.");
                }
            }
            else
            {
                return NotFound("Plan not found");
            }
        }

        #endregion

    }
}
