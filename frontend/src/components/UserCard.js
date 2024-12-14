import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function UserCard(props) {
  const randomImageUrl = `http://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;

  return (
    <Card style={{ width: '18rem', display: 'flex', flexDirection: 'column' }} className="mb-3">
      <Card.Img variant="top" src={randomImageUrl} alt={props.title} style={{ width: '50%', margin: '0 auto', marginTop: '1rem'}}/>
    </Card>
  );
}

export default UserCard;