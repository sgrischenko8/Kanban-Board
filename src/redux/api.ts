import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Octokit } from 'octokit';

const octokit = new Octokit({});

type Params = { owner: string; repo: string };

export const fetchIssues = createAsyncThunk(
  '/repos/{owner}/{repo}/issues',
  async (params: Params, thunkAPI) => {
    try {
      const response = await octokit.request(
        'GET /repos/{owner}/{repo}/issues',
        {
          owner: params.owner,
          repo: params.repo,
          state: 'all',
          per_page: 100,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );
      const result = await axios.get(
        `https://api.github.com/repos/${params.owner}/${params.repo}`,
      );
      return {
        owner: params.owner,
        repo: params.repo,
        issues: response.data,
        stars: result.data.stargazers_count,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message as string);
      }
    }
  },
);

export const fetchStars = createAsyncThunk(
  '/repos/{owner}/{repo}',
  async (params: Params, thunkAPI) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${params.owner}/${params.repo}`,
      );

      return response.data.stargazers_count;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message as string);
      }
    }
  },
);

export const getSavedRepo = createAsyncThunk('', async (repo: object) => {
  return repo;
});
