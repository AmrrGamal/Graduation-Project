using AIDentify.Models;

namespace AIDentify.IRepositry
{
    public interface ISystemUpdateRepository
    {
        List<SystemUpdate> GetAllSystemUpdates();
        SystemUpdate GetSystemUpdate(string id);
        List<SystemUpdate> GetAllSystemUpdateByAdminId(string adminId);
        void AddSystemUpdate(string adminId, SystemUpdate systemUpdate);
        void UpdateSystemUpdate(SystemUpdate systemUpdate);
        void DeleteSystemUpdate(SystemUpdate systemUpdate);
        void DeleteAllSystemUpdateForThisAdmin(string adminId);
    }
}
