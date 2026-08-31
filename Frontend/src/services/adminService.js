
import api from "./api";

export const getAdminDashboard =
  async () => {
    const response = await api.get(
      "/admin/dashboard"
    );

    return response.data;
  };

export const getAdminUsers =
  async (params = {}) => {
    const response = await api.get(
      "/admin/users",
      {
        params
      }
    );

    return response.data;
  };

export const updateUserRole =
  async (id, role) => {
    const response = await api.put(
      `/admin/users/${id}/role`,
      {
        role
      }
    );

    return response.data;
  };

export const updateUserStatus =
  async (id, isActive) => {
    const response = await api.put(
      `/admin/users/${id}/status`,
      {
        isActive
      }
    );

    return response.data;
  };

export const deleteUser =
  async (id) => {
    const response = await api.delete(
      `/admin/users/${id}`
    );

    return response.data;
  };