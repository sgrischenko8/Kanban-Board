import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './index.css';

import Button from 'react-bootstrap/Button';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Loader } from './components/Issue/Loader/Loader';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { fetchIssues, getSavedRepo } from './redux/api';

import {
  selectRepo,
  selectRepos,
  selectLoading,
  selectError,
} from './redux/selectors';
import { setRepos } from './redux/reposSlice';
import { IssueCard } from './components/Issue/Issue/IssueCard';
import { minimizeIssue } from './utils/minimizeIssue';
import { reorder } from './utils/reorder';
import { move } from './utils/move';
import { Issue, Repo } from '../@types/custom';
import { AppDispatch } from './redux/store';

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'var(--bs-dark-bg-subtle)',
  border: '1px solid var(--bs-border-color)',
  padding: 8,
});

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onDragEnd(result: any) {
    const { source, destination } = result;
    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const newItems: Issue[] = reorder(
        getList(source.droppableId),
        source.index,
        destination.index,
      );

      if (source.droppableId === 'ToDo') {
        setToDoList(newItems);
      }
      if (source.droppableId === 'InProgress') {
        setInProgressList(newItems);
      }
      if (source.droppableId === 'Done') {
        setDoneList(newItems);
      }
    } else {
      const movedLists: { [key: string]: Issue[] } = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination,
      ) as { [key: string]: Issue[] };

      if (movedLists.ToDo) {
        setToDoList(movedLists.ToDo);
      }
      if (movedLists.InProgress) {
        setInProgressList(movedLists.InProgress);
      }
      if (movedLists.Done) {
        setDoneList(movedLists.Done);
      }
    }
  }

  const listNames = ['ToDo', 'In Progress', 'Done'];

  function getList(list: string) {
    if (list === 'ToDo') {
      return toDoList;
    }
    if (list === 'In Progress' || list === 'InProgress') {
      return inProgressList;
    }
    if (list === 'Done') {
      return doneList;
    }
  }

  // --------------  submit form function  -----------------------------
  function submitHandler(e: React.FormEvent) {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const tempUrlArray = target.repoUrl.value.split('/');

    //-----------check if repo url is valid:
    if (tempUrlArray.length > 4) {
      const params = { owner: tempUrlArray[3], repo: tempUrlArray[4] };

      if (!error && repo.owner === params.owner && repo.repo === params.repo) {
        target.reset();
        return;
      }

      if (Object.keys(repo).length > 0) {
        updatePersistRepo();
      }

      // ---- check if repo was modified. check it in persist storage

      const finded = repos.find((el: Repo) => {
        return el.owner === params.owner && el.repo === params.repo;
      });

      if (!error && finded) {
        dispatch(getSavedRepo(finded));
        target.reset();
        return;
      }

      dispatch(fetchIssues(params)).then((resp) => {
        if (resp.type === '/repos/{owner}/{repo}/issues/fulfilled') {
          target.reset();
          return;
        }
      });
    }
  }

  function getStarsAmount() {
    let rating = 0;
    rating = repo.stars / 1000;
    if (rating < 1) {
      rating = +rating.toFixed(3).toString();
    } else {
      rating = +rating.toFixed(0);
    }
    return rating + ' K';
  }

  return (
    <>
      {isLoading && <Loader />}
      <section className="p-3 d-flex flex-column fs-6">
        <form onSubmit={submitHandler} className="w-100 d-flex gap-2 p-2">
          <input
            className="form-control border border-dark rounded-1"
            type="url"
            name="repoUrl"
            id="url"
            placeholder="Enter repo URL"
            pattern="https://github.com/.*/.*"
            required
          />

          <Button
            type="submit"
            title="Load issues"
            variant="outline-dark"
            className="rounded-0"
            disabled={isLoading}
            onClick={() => false}
          >
            Load issues
          </Button>
        </form>
        {error ? (
          <p className="p-2 text-danger">Have some problems... Page {error}</p>
        ) : null}
        {!error && Object.keys(repo).length > 0 && (
          <>
            <div className="d-flex gap-3 p-2">
              <Breadcrumb className="text-capitalize">
                <Breadcrumb.Item
                  href={`https://github.com/${repo.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repo.owner}
                </Breadcrumb.Item>

                <Breadcrumb.Item
                  href={`https://github.com/${repo.owner}/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repo.repo}
                </Breadcrumb.Item>
              </Breadcrumb>

              <p className="d-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 47.94 47.94"
                >
                  <path
                    d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757
	c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042
	c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685
	c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528
	c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956
	C22.602,0.567,25.338,0.567,26.285,2.486z"
                    fill="#ED8A19"
                  />
                </svg>
                {getStarsAmount()} stars
              </p>
            </div>
            {repo.issues.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <ul className="list justify-content-between gx-5 list">
                  {listNames.map((el, index) => (
                    <li key={index} className="p-2 col-md-4 col-sm-4">
                      <h2 className="text-center fs-5 fw-medium mb-3">{el}</h2>
                      <Droppable droppableId={el.replace(' ', '')}>
                        {(provided, snapshot) => (
                          <ul
                            className="border border-dark h-100"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                          >
                            {getList(el)?.map((item, index) => (
                              <li key={item.id} className="">
                                <IssueCard item={item} index={index} />
                              </li>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </li>
                  ))}
                </ul>
              </DragDropContext>
            ) : (
              <p className="p-2">There is no issues here</p>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default App;
