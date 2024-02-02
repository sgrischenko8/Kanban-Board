/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export default content;
}

export type Issue = {
  id: number;
  title: string;
  number: number;
  user: { type: string };
  comments: number;
  created_at: string;
  closed_at?: string;
  assignees?: object[];
  assignee?: string;
};

export type Repo = {
  stars: number;
  owner: string;
  issues: Issues[];
  repo: string;
};
