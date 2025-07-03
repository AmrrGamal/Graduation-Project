using AIDentify.IRepositry;
using AIDentify.Models;
using AIDentify.Models.Context;
using Microsoft.EntityFrameworkCore;

namespace AIDentify.Repositry
{
    public class SystemUpdateRepository : ISystemUpdateRepository
    {
        private readonly ContextAIDentify _contextAIDentify;

        public SystemUpdateRepository(ContextAIDentify contextAIDentify)
        {
            _contextAIDentify = contextAIDentify;
        }

        #region Get All
        public List<SystemUpdate> GetAllSystemUpdates()
        {
            return _contextAIDentify.SystemUpdate.Include(s => s.Admin).ToList();
        }
        #endregion

        #region Get by Id
        public SystemUpdate GetSystemUpdate(string id)
        {
            return _contextAIDentify.SystemUpdate.Include(s => s.Admin).FirstOrDefault(s => s.Id == id);
        }
        #endregion

        #region Get All by Admin Id
        public List<SystemUpdate> GetAllSystemUpdateByAdminId(string adminId)
        {
            return _contextAIDentify.SystemUpdate.Where(s => s.AdminId == adminId).ToList();
        }
        #endregion

        #region Add
        public void AddSystemUpdate(string adminId, SystemUpdate systemUpdate)
        {
            var admin = _contextAIDentify.Admin.Where(a => a.Admin_ID == adminId).FirstOrDefault();
            if (admin != null)
            {
                admin.SystemUpdates.Add(systemUpdate);
                _contextAIDentify.Add(systemUpdate);
                _contextAIDentify.SaveChanges();
            }
        }
        #endregion

        #region Update
        public void UpdateSystemUpdate(SystemUpdate systemUpdate)
        {
            var oldSystemUpdate = _contextAIDentify.SystemUpdate.Where(s => s.Id == systemUpdate.Id).FirstOrDefault();
            if (oldSystemUpdate != null)
            {
                _contextAIDentify.Entry(oldSystemUpdate).CurrentValues.SetValues(systemUpdate);
                _contextAIDentify.SaveChanges();
            }
        }
        #endregion

        #region Delete
        public void DeleteSystemUpdate(SystemUpdate systemUpdate)
        {
            var admin = _contextAIDentify.Admin.Where(a => a.Admin_ID == systemUpdate.AdminId).FirstOrDefault();
            if (admin != null)
            {
                _contextAIDentify.SystemUpdate.Remove(systemUpdate);
                admin.SystemUpdates.Remove(systemUpdate);
                _contextAIDentify.SaveChanges();
            }
        }
        #endregion

        #region Delete All For this Admin
        public void DeleteAllSystemUpdateForThisAdmin(string adminId)
        {
            var admin = _contextAIDentify.Admin.Where(a => a.Admin_ID == adminId).FirstOrDefault();
            if (admin != null)
            {
                var systemUpdates = _contextAIDentify.SystemUpdate.Where(s => s.AdminId == adminId).ToList();
                foreach (var systemUpdate in systemUpdates)
                {
                    admin.SystemUpdates.Remove(systemUpdate);
                    _contextAIDentify.SystemUpdate.Remove(systemUpdate);
                }
                _contextAIDentify.SaveChanges();
            }
        }
        #endregion
    }
}
