import axios from 'axios';

const BASE_URL = '/api';
export const ALLOWED_IMEIS = ['865044073967657', '865044073949366'];

const normalizeList = (payload) => {
  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return {
    items,
    count: payload?.count ?? items.length,
    filters: payload?.filters ?? {},
  };
};

export const api = {
  getSnapshots: async (imei, limit = 100) => {
    const { data } = await axios.get(`${BASE_URL}/snapshots`, {
      params: { imei, limit },
    });
    return normalizeList(data);
  },

  getCycleDetails: async (imei, cycleNumber) => {
    const { data } = await axios.get(`${BASE_URL}/snapshots/${imei}/cycles/${cycleNumber}`);
    return data?.data ?? data;
  },
};