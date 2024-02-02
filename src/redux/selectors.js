export const selectLoading = (state) => state.repo.isLoading;

export const selectError = (state) => state.repo.error;

export const selectRepo = (state) => state.repo.items;

export const selectRepos = (state) => state.repos;
