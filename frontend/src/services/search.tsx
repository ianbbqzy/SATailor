import axios from 'axios';
import { auth } from './auth';

//Set base URL as environment variable
const baseURL = 'something';

function makeQuery(query: String){
    const token = auth.currentUser?.getIdToken(true);
    token.then((idToken) => {
        axios.get(baseURL, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            },
            params: {
                query: query
            }
        }).then((response) => {
            console.log(response.data);
        }).catch((error) => {
            console.error(error);
        });
    }).catch((error) => {
        console.error(error);
    });
}