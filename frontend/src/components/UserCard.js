import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function UserCard(props) {
  return (
    <Card style={{ width: '18rem' }} className="mb-3">
      <Card.Body>
        <Card.Title>{props.first_name + " " + props.last_name}</Card.Title>
        <Card.Text>
          _id: {props._id}
        </Card.Text>
        <Button href={"/users/" + props._id} variant="outline-primary">Open User</Button>
      </Card.Body>
    </Card>
  );
}

export default UserCard;