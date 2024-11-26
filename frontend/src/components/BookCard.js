import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function BookCard(props) {
  return (
    <Card style={{ width: '18rem' }} className="mb-3">
      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        <Card.Text>
          _id: {props._id}
        </Card.Text>
        <Button href={"/book/" + props._id} variant="outline-primary">Open Book</Button>
      </Card.Body>
    </Card>
  );
}

export default BookCard;