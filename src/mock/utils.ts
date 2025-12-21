export const delay = (ms = 300) =>
  new Promise((res) => setTimeout(res, ms));

export const paginate = <T>(
  data: T[],
  page = 1,
  limit = 10
) => ({
  data: data.slice((page - 1) * limit, page * limit),
  total: data.length,
  page,
  limit,
  totalPages: Math.ceil(data.length / limit),
});
