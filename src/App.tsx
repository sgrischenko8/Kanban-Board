import './index.css';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Form } from './components/Form/Form';
import { Breadcrumbs } from './components/BreadCrumb/BreadCrumb';
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';
import { Loader } from './components/Loader/Loader';

import {
  selectRepo,
  selectRepos,
  selectLoading,
  selectError,
} from './redux/selectors';
import { setRepos } from './redux/reposSlice';
import { AppDispatch } from './redux/store';
import { fetchIssues, getSavedRepo } from './redux/api';
import { minimizeIssue } from './utils/minimizeIssue';

import { Issue, Repo } from '../@types/custom';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  const persistedRepos = useSelector(selectRepos);
  if (!persistedRepos?.repos) {
    // initiation persist storage
    dispatch(setRepos([]));
  }
  const repos = persistedRepos.repos;

  const [toDoList, setToDoList] = useState<Issue[]>([]);
  const [inProgressList, setInProgressList] = useState<Issue[]>([]);
  const [doneList, setDoneList] = useState<Issue[]>([]);

  const repo = useSelector(selectRepo);
  const isLoading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    if (Object.keys(repo).length === 0) {
      return;
    }
    const finded = repos.find((el: Repo) => {
      return el.owner === repo.owner && el.repo === repo.repo;
    });

    if (finded) {
      //check for empty issues errors
      if (!finded.issues.find((el: Issue[]) => el.length !== 0)) {
        const otherRepos = repos.filter(
          (el: Repo) => el.owner !== repo.owner && el.repo !== repo.owner,
        );
        dispatch(setRepos(otherRepos));
        return;
      }
      setToDoList(finded.issues[0]);
      setInProgressList(finded.issues[1]);
      setDoneList(finded.issues[2]);
      return;
    }

    const notClosedIssues: Issue[] = [];
    const inProgressIssues: Issue[] = [];
    const closedIssues: Issue[] = [];
    repo.issues.map((el: Issue) => {
      if (!el.closed_at && (el.assignees?.length === 0 || el.assignee)) {
        notClosedIssues.push(minimizeIssue(el));
      }
      if (el.assignees) {
        if (!el.closed_at && (el.assignees.length > 0 || el.assignee)) {
          inProgressIssues.push(minimizeIssue(el));
        }
      }

      if (el.closed_at) {
        closedIssues.push(minimizeIssue(el));
      }
    });
    setToDoList(notClosedIssues);
    setInProgressList(inProgressIssues as Issue[]);
    setDoneList(closedIssues as Issue[]);
  }, [repo, repos]);

  useEffect(() => {
    if (Object.keys(repo).length === 0) {
      return;
    }
    updatePersistRepo();
  }, [toDoList, inProgressList, doneList]);

  function updatePersistRepo() {
    if (repo?.issues?.length === 0) {
      return;
    }

    const otherRepos = repos.filter(
      (el: Repo) => el.owner !== repo.owner && el.repo !== repo.owner,
    );
    const modifiedRepo = {
      ...repo,
      issues: [toDoList, inProgressList, doneList],
    };
    const newRepos = [...otherRepos, modifiedRepo];

    dispatch(setRepos(newRepos));
  }

  // --------------  submit form function  -----------------------------
  async function submitFormHandler(params: { owner: string; repo: string }) {
    if (Object.keys(repo).length > 0) {
      updatePersistRepo();
    }

    // ---- check if repo was modified. check it in persist storage
    const finded = repos.find((el: Repo) => {
      return el.owner === params.owner && el.repo === params.repo;
    });

    if (!error && finded) {
      dispatch(getSavedRepo(finded));
      return true;
    }

    return dispatch(fetchIssues(params)).then((resp) => {
      if (resp.type === '/repos/{owner}/{repo}/issues/fulfilled') {
        return true;
      }
      return false;
    });
  }

  return (
    <>
      {isLoading && <Loader />}
      <section className="p-3 d-flex flex-column fs-6">
        <Form repo={repo} onSubmit={submitFormHandler} />
        {error ? (
          <p data-testid="err" className="p-2 text-danger">
            Have some problems... Page not found
          </p>
        ) : null}

        {!error && <Breadcrumbs repo={repo} />}
        {!error && (
          <KanbanBoard
            repo={repo}
            toDoList={toDoList}
            setToDoList={setToDoList}
            inProgressList={inProgressList}
            setInProgressList={setInProgressList}
            doneList={doneList}
            setDoneList={setDoneList}
          />
        )}
      </section>
    </>
  );
};

export default App;
