import { Draggable } from '@hello-pangea/dnd';
import Card from 'react-bootstrap/Card';
import { getDaysAgo } from '../../../utils/getDaysAgo';
import { Issue } from '../../../../@types/custom';

interface IssueCardProps {
  item: Issue;
  index: number;
}

const getItemStyle = (isDragging: boolean, draggableStyle: unknown) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: `12px 20px`,
  margin: `0 0 8px 0`,
  borderRadius: '1.5rem',

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'var(--bs-light-bg-subtle)',

  // styles we need to apply on draggables
  ...(draggableStyle as object),
});

export const IssueCard = ({ item, index }: IssueCardProps) => {
  const { id, title, number, user, created_at, comments } = item;

  return (
    <Draggable draggableId={id.toString()} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          bg={'white'}
          key={title}
          text={'dark'}
          style={
            getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style,
            ) as object
          }
          className="mb-2"
          border="dark"
          as="div"
        >
          <Card.Body className="p-0">
            <Card.Title as="h3" className="p-0 mb-1 fs-6 ">
              {title}
            </Card.Title>
            <Card.Text className="p-0 mb-1 fs-6 font-monospace">
              #{number} opened {getDaysAgo(created_at)} days ago.
            </Card.Text>
            <Card.Text className="p-0 mb-1 fs-6 font-monospace">
              {user.type} | Comments: {comments}
            </Card.Text>
          </Card.Body>
        </Card>
      )}
    </Draggable>
  );
};
