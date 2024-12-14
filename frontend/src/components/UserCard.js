import Card from 'react-bootstrap/Card';

function UserCard(props) {
  const randomImageUrl = `http://i.pravatar.cc/1080?img=${Math.floor(Math.random() * 70)}`;

  return (
    <Card style={{ width: '24rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="mb-3 mx-auto">
      <Card.Img variant="top" src={randomImageUrl} alt={props.title} style={{ width: '80%', margin: '0 auto', marginTop: '1rem', marginBottom: '1rem'}}/>
    </Card>
  );
}

export default UserCard;