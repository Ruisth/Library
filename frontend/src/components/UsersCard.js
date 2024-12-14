import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function UsersCard(props) {
  const randomImageUrl = `http://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;

  return (
    <Card style={{ width: '18rem', display: 'flex', flexDirection: 'column' }} className="mb-3">
      <Card.Img variant="top" src={randomImageUrl} alt={props.title} style={{ width: '50%', margin: '0 auto', marginTop: '1rem'}}/>
      <Card.Body style={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
        <Card.Title style={{ fontSize: '1.25rem', margin: '0 auto', marginBottom: '1rem' }}> {props.first_name + " " + props.last_name}</Card.Title>
        <Card.Text style={{margin: '0 auto'}}>
          <strong>Job:</strong> {props.job || "N/A"}
        </Card.Text>
        <Button href={"/users/" + props._id} variant="outline-primary">Open User</Button>
      </Card.Body>
    </Card>
  );
}

export default UsersCard;