// frontend/src/components/Profile.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [resume, setResume] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Fetch user's saved resume from backend
    axios.get(`/resume/${userId}`)
      .then(response => {
        setResume(response.data.resume);
      })
      .catch(error => {
        console.error('Error fetching user resume:', error);
      });
  }, [userId]);

  const handleSave = () => {
    // Save resume to backend
    axios.post(`/resume/${userId}`, { resume })
      .then(response => {
        console.log('Resume saved:', response.data);
      })
      .catch(error => {
        console.error('Error saving resume:', error);
      });
  };

  return (
    <div>
      <h1>Your Resume</h1>
      <textarea
        value={resume}
        onChange={e => setResume(e.target.value)}
        style={{ width: '60vw', minHeight: '10em' }}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Profile;

// frontend/src/components/Navbar.tsx
// ... existing code ...
import { Link } from 'react-router-dom';

// ... existing code ...

return (
  <nav>
    {/* ... existing buttons ... */}
    <Link to="/profile">
      <button>Profile</button>
    </Link>
  </nav>
);

// backend/app/main.py
# ... existing imports ...
from flask import Flask, request
from flask_dynamo import Dynamo

app = Flask(__name__)
dynamo = Dynamo(app)

# ... existing routes ...

@app.route('/resume/<user_id>', methods=['GET', 'POST'])
def handle_resume(user_id):
    if request.method == 'POST':
        resume = request.json.get('resume')
        dynamo.tables['users'].put_item(Item={'id': user_id, 'resume': resume})
        return {'message': 'Resume saved.'}, 200
    else:
        response = dynamo.tables['users'].get_item(Key={'id': user_id})
        return {'resume': response['Item']['resume']}, 200