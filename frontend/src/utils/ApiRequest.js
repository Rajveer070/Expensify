const host = "http://localhost:5000";
export const setAvatarAPI = `${host}/api/auth/setAvatar`;
export const registerAPI = `${host}/api/auth/register`;
export const loginAPI = `${host}/api/auth/login`;
export const addTransaction = `${host}/api/v1/addTransaction`;
export const getTransactions = `${host}/api/v1/getTransaction`;
export const editTransactions = `${host}/api/v1/updateTransaction`;
export const deleteTransactions = `${host}/api/v1/deleteTransaction`;
export const getAllCategories = `${host}/api/v1/category/getAllCategories`;
export const addCategory = `${host}/api/v1/category/addCategory`;
export const updateCategory = `${host}/api/v1/category/updateCategory`;
// export const deleteCategory = `${host}/api/v1/category/deleteCategory`;
export const deleteCategory = `${host}/api/v1/category/delete`;