import { Issue } from '../../@types/custom';

export function minimizeIssue(issue: Issue): Issue {
  const { id, title, number, user, created_at, comments } = issue;
  return { id, title, number, user, created_at, comments } as Issue;
}
