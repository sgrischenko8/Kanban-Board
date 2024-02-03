import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { IssueCard } from './IssueCard/IssueCard';

import { Repo, Issue } from '../../../@types/custom';
import { reorder } from '../../utils/reorder';
import { move } from '../../utils/move';

interface KanbanBoardProps {
  repo: Repo;
  toDoList: Issue[];
  setToDoList: (toDoList: Issue[]) => void;
  inProgressList: Issue[];
  setInProgressList: (inProgressList: Issue[]) => void;
  doneList: Issue[];
  setDoneList: (doneList: Issue[]) => void;
}

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'var(--bs-dark-bg-subtle)',
  border: '1px solid var(--bs-border-color)',
  padding: 8,
});

export const KanbanBoard = ({
  repo,
  toDoList,
  setToDoList,
  inProgressList,
  setInProgressList,
  doneList,
  setDoneList,
}: KanbanBoardProps) => {
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

  return (
    <>
      {Object.keys(repo).length > 0 && (
        <>
          {repo.issues.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <ul
                data-testid="list"
                className="list justify-content-between gx-5 list"
              >
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
                            <li key={item.id}>
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
    </>
  );
};
