import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function BookCard(props) {
  return (
    <Card style={{ width: '18rem', display: 'flex', flexDirection: 'column' }} className="mb-3">
      {props.thumbnailUrl && (
        <Card.Img variant="top" src={props.thumbnailUrl} alt={props.title} style={{ width: '50%', margin: '0 auto', marginTop: '1rem'}}/>
      )}
      <Card.Body style={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
        <Card.Title style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{props.title}</Card.Title>
        <Card.Text>
          <strong>Author:</strong> {props.authors ? props.authors.join(", ") : "N/A"}
        </Card.Text>
        <Card.Text>
          <strong>Category:</strong> {props.categories ? props.categories.join(", ") : "N/A"}
        </Card.Text>
        <div style={{ marginTop: 'auto' }}>
        <Button href={"/books/id/" + props._id} variant="outline-primary" style={{ width: '100%' }}>Open Book</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default BookCard;