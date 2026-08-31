
import api from "./api";

export const createGeneration = async (
  payload
) => {
  const response = await api.post(
    "/generations",
    payload
  );

  return response.data;
};

export const getGenerations = async (
  params = {}
) => {
  const response = await api.get(
    "/generations",
    {
      params
    }
  );

  return response.data;
};

export const getGeneration = async (id) => {
  const response = await api.get(
    `/generations/${id}`
  );

  return response.data;
};

export const deleteGeneration = async (id) => {
  const response = await api.delete(
    `/generations/${id}`
  );

  return response.data;
};

